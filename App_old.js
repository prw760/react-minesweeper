import React from 'react';

const ButtonComponent = ({onClickHandler}) => {

    const handleClick = (event) => {
        onClickHandler(event);
    };

    return (
        <button onClick={() => console.log('Button clicked!')}>Click me</button>
    );
};

export default ButtonComponent;