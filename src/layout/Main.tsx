import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from "../components/Header";
import Currencies from "../pages/Currencies";
import Converter from "../pages/Converter";

function Main() {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<Currencies />} />
                <Route path="/converter" element={<Converter />} />
                <Route path="*" element={<Currencies />} />
            </Routes>
        </>
    );
}

export default Main;
