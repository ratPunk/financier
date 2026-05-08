<?php
declare(strict_types=1);

require_once __DIR__ . '/lib.php';

apply_cors();

try {
    $action = $_GET['action'] ?? '';
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    switch ($action) {
        case 'register':
            require_method('POST');
            handle_register();
            break;

        case 'login':
            require_method('POST');
            handle_login();
            break;

        case 'logout':
            require_method('POST');
            handle_logout();
            break;

        case 'me':
            require_method('GET');
            handle_me();
            break;

        case 'tracked':
            if ($method === 'GET')    { handle_tracked_list(); break; }
            if ($method === 'POST')   { handle_tracked_add(); break; }
            if ($method === 'DELETE') { handle_tracked_delete(); break; }
            json_error('Method not allowed', 405);
            break;

        case 'currencies':
            require_method('GET');
            handle_currencies();
            break;

        case 'preferences':
            if ($method === 'GET')  { handle_prefs_get(); break; }
            if ($method === 'POST') { handle_prefs_set(); break; }
            json_error('Method not allowed', 405);
            break;

        default:
            json_error('Unknown action', 404);
    }
} catch (PDOException $e) {
    json_error('Database error: ' . $e->getMessage(), 500);
} catch (Throwable $e) {
    json_error('Server error: ' . $e->getMessage(), 500);
}

// ---------- Handlers ----------

function handle_register(): void {
    $in = read_json_input();
    $username = trim((string)($in['username'] ?? ''));
    $email    = trim((string)($in['email'] ?? ''));
    $password = (string)($in['password'] ?? '');

    if ($username === '' || strlen($username) < 3 || strlen($username) > 50) {
        json_error('Username must be 3-50 chars', 422);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_error('Invalid email', 422);
    }
    if (strlen($password) < 6) {
        json_error('Password must be at least 6 chars', 422);
    }

    $pdo = db();

    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = :e OR username = :u LIMIT 1');
    $stmt->execute([':e' => $email, ':u' => $username]);
    if ($stmt->fetch()) {
        json_error('User with this email or username already exists', 409);
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare(
        'INSERT INTO users (username, email, password_hash) VALUES (:u, :e, :p)'
    );
    $stmt->execute([':u' => $username, ':e' => $email, ':p' => $hash]);
    $userId = (int)$pdo->lastInsertId();

    $token = create_session($userId);

    json_response([
        'token' => $token,
        'user'  => [
            'id'       => $userId,
            'username' => $username,
            'email'    => $email,
        ],
    ], 201);
}

function handle_login(): void {
    $in = read_json_input();
    $login    = trim((string)($in['login'] ?? $in['email'] ?? $in['username'] ?? ''));
    $password = (string)($in['password'] ?? '');

    if ($login === '' || $password === '') {
        json_error('Login and password are required', 422);
    }

    $stmt = db()->prepare(
        'SELECT id, username, email, password_hash, is_active
           FROM users WHERE email = :le OR username = :lu LIMIT 1'
    );
    $stmt->execute([':le' => $login, ':lu' => $login]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        json_error('Invalid credentials', 401);
    }
    if ((int)$user['is_active'] !== 1) {
        json_error('Account disabled', 403);
    }

    db()->prepare('UPDATE users SET last_login_at = NOW() WHERE id = :id')
        ->execute([':id' => $user['id']]);

    $token = create_session((int)$user['id']);

    json_response([
        'token' => $token,
        'user'  => [
            'id'       => (int)$user['id'],
            'username' => $user['username'],
            'email'    => $user['email'],
        ],
    ]);
}

function handle_logout(): void {
    $token = get_bearer_token();
    if ($token) {
        db()->prepare('DELETE FROM user_sessions WHERE token = :t')->execute([':t' => $token]);
    }
    json_response(['ok' => true]);
}

function handle_me(): void {
    $u = require_auth();
    ensure_user_prefs_columns();
    $stmt = db()->prepare('SELECT theme, language FROM users WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $u['id']]);
    $prefs = $stmt->fetch() ?: ['theme' => null, 'language' => null];
    json_response(['user' => [
        'id'       => (int)$u['id'],
        'username' => $u['username'],
        'email'    => $u['email'],
        'theme'    => $prefs['theme'],
        'language' => $prefs['language'],
    ]]);
}

function ensure_user_prefs_columns(): void {
    static $checked = false;
    if ($checked) return;
    $checked = true;
    try {
        $cols = db()->query("SHOW COLUMNS FROM users")->fetchAll();
        $names = array_column($cols, 'Field');
        if (!in_array('theme', $names, true)) {
            db()->exec("ALTER TABLE users ADD COLUMN theme VARCHAR(10) NULL DEFAULT NULL");
        }
        if (!in_array('language', $names, true)) {
            db()->exec("ALTER TABLE users ADD COLUMN language VARCHAR(5) NULL DEFAULT NULL");
        }
    } catch (Throwable $e) { /* ignore */ }
}

function handle_prefs_get(): void {
    $u = require_auth();
    ensure_user_prefs_columns();
    $stmt = db()->prepare('SELECT theme, language FROM users WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $u['id']]);
    $row = $stmt->fetch() ?: ['theme' => null, 'language' => null];
    json_response(['preferences' => [
        'theme'    => $row['theme'],
        'language' => $row['language'],
    ]]);
}

function handle_prefs_set(): void {
    $u = require_auth();
    ensure_user_prefs_columns();
    $in = read_json_input();
    $theme = isset($in['theme']) ? (string)$in['theme'] : null;
    $lang  = isset($in['language']) ? (string)$in['language'] : null;

    if ($theme !== null && !in_array($theme, ['light', 'dark'], true)) {
        json_error('Invalid theme', 422);
    }
    if ($lang !== null && !preg_match('/^[a-z]{2}$/', $lang)) {
        json_error('Invalid language', 422);
    }

    $sets = [];
    $params = [':id' => $u['id']];
    if ($theme !== null) { $sets[] = 'theme = :t';    $params[':t'] = $theme; }
    if ($lang  !== null) { $sets[] = 'language = :l'; $params[':l'] = $lang; }
    if (!$sets) json_error('Nothing to update', 422);

    $sql = 'UPDATE users SET ' . implode(', ', $sets) . ' WHERE id = :id';
    db()->prepare($sql)->execute($params);

    json_response(['ok' => true]);
}

function handle_currencies(): void {
    $rows = db()->query('SELECT code, name, symbol FROM currencies ORDER BY code')->fetchAll();
    json_response(['currencies' => $rows]);
}

function handle_tracked_list(): void {
    $u = require_auth();
    $stmt = db()->prepare(
        'SELECT id, base_currency, quote_currency, sort_order, created_at
           FROM user_tracked_currencies
          WHERE user_id = :uid
          ORDER BY sort_order ASC, id DESC'
    );
    $stmt->execute([':uid' => $u['id']]);
    $rows = $stmt->fetchAll();
    $items = array_map(static function ($r) {
        return [
            'id'              => (int)$r['id'],
            'mainCurrencies'  => $r['base_currency'],
            'secondCurrencies'=> $r['quote_currency'],
            'sortOrder'       => (int)$r['sort_order'],
            'createdAt'       => $r['created_at'],
        ];
    }, $rows);
    json_response(['items' => $items]);
}

function handle_tracked_add(): void {
    $u = require_auth();
    $in = read_json_input();
    $base  = strtoupper(trim((string)($in['base'] ?? $in['mainCurrencies'] ?? '')));
    $quote = strtoupper(trim((string)($in['quote'] ?? $in['secondCurrencies'] ?? '')));

    if (!preg_match('/^[A-Z]{3}$/', $base) || !preg_match('/^[A-Z]{3}$/', $quote)) {
        json_error('Invalid currency code', 422);
    }
    if ($base === $quote) {
        json_error('Currencies must differ', 422);
    }

    $pdo = db();

    // Auto-register currencies that aren't in the dictionary yet (frontend
    // supports more codes than were seeded in the SQL dump).
    $ins = $pdo->prepare('INSERT IGNORE INTO currencies (code, name) VALUES (:c, :n)');
    $ins->execute([':c' => $base,  ':n' => $base]);
    $ins->execute([':c' => $quote, ':n' => $quote]);

    $exists = $pdo->prepare(
        'SELECT id FROM user_tracked_currencies
          WHERE user_id = :uid AND base_currency = :b AND quote_currency = :q LIMIT 1'
    );
    $exists->execute([':uid' => $u['id'], ':b' => $base, ':q' => $quote]);
    if ($row = $exists->fetch()) {
        json_response(['id' => (int)$row['id'], 'duplicate' => true]);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO user_tracked_currencies (user_id, base_currency, quote_currency, sort_order)
         VALUES (:uid, :b, :q, 0)'
    );
    $stmt->execute([':uid' => $u['id'], ':b' => $base, ':q' => $quote]);
    $id = (int)$pdo->lastInsertId();

    json_response([
        'id'               => $id,
        'mainCurrencies'   => $base,
        'secondCurrencies' => $quote,
    ], 201);
}

function handle_tracked_delete(): void {
    $u = require_auth();
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) {
        $in = read_json_input();
        $id = (int)($in['id'] ?? 0);
    }
    if ($id <= 0) json_error('id is required', 422);

    $stmt = db()->prepare(
        'DELETE FROM user_tracked_currencies WHERE id = :id AND user_id = :uid'
    );
    $stmt->execute([':id' => $id, ':uid' => $u['id']]);

    json_response(['ok' => true, 'deleted' => $stmt->rowCount()]);
}

function create_session(int $userId): string {
    $token = generate_token();
    $ttl   = (int)app_config()['session_ttl_days'];
    $stmt  = db()->prepare(
        'INSERT INTO user_sessions (user_id, token, ip_address, user_agent, expires_at)
         VALUES (:uid, :t, :ip, :ua, DATE_ADD(NOW(), INTERVAL :d DAY))'
    );
    $stmt->execute([
        ':uid' => $userId,
        ':t'   => $token,
        ':ip'  => substr($_SERVER['REMOTE_ADDR'] ?? '', 0, 45),
        ':ua'  => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255),
        ':d'   => $ttl,
    ]);

    // Cleanup old sessions occasionally
    if (random_int(1, 50) === 1) {
        db()->exec('DELETE FROM user_sessions WHERE expires_at < NOW()');
    }

    return $token;
}
