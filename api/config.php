<?php
// Database configuration. Adjust if MAMP uses different credentials.
return [
    'db' => [
        'host'    => '127.0.0.1',
        'port'    => 3306,
        'name'    => 'financier',
        'user'    => 'root',
        'pass'    => 'root', // MAMP default. Change if needed.
        'charset' => 'utf8mb4',
    ],
    'session_ttl_days' => 30,
    // Allowed CORS origins for the React dev server
    'cors_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],
];
