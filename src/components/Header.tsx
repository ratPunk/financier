import React from 'react';
import "../css/cssComponents/header.css";
import {Link} from "react-router-dom";
import {TbHexagonLetterFFilled} from "react-icons/tb";

function Header() {
    return (
        <header>
            <div className="header-container">
            <div className={"left-side"}>
                <div className={"logo"}>
                    {React.createElement(TbHexagonLetterFFilled as React.ComponentType<any>, {
                        size: 34, // изменить размер
                        color: "#4361ee", // изменить цвет
                        className: "my-icon-class" // добавить CSS класс
                    })}
                    <span>Financier</span>
                </div>
            </div>
            <div className={"right-side"}>
                {/*<Link to={"/"}/>*/}
            </div>
            </div>
        </header>
    );
}

export default Header;