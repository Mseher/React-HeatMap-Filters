// Header.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {

    const location = useLocation();

    // Define an array of paths where you want to hide the header
    const hiddenPaths = ['/trips'];

    // Check if the current page pathname is included in the hiddenPaths array
    const isHidden = hiddenPaths.includes(location.pathname);

    // If the current page pathname is in the hiddenPaths array, return null to hide the header
    if (isHidden) {
        return null;
    }
    
    return (
        <header style={{ background: '#eee', padding: '10px 0', textAlign: 'center' }}>
            <nav>
                {/* <Link to="/" style={{ margin: '0 10px' }}>Monthly</Link>
                <Link to="/compare" style={{ margin: '0 10px' }}>Trip</Link> */}
                <Link to="/heatmap" style={{ margin: '0 10px' }}>Heatmap</Link>
                
                {/* <Link to="/mxak" style={{ margin: '0 10px' }}>Mxak</Link>
                <Link to="/spire" style={{ margin: '0 10px' }}>Spire</Link>
                <Link to="/mitchell" style={{ margin: '0 10px' }}>Mitchell</Link> */}
                
                
                {/* Add more links as needed */}
            </nav>
        </header>
    );
};

export default Header;
