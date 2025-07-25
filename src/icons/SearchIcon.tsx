// import React from 'react'

// const SearchIcon = () => {
//     return (
//         <svg
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 100 100"
//             width="50px"
//             height="50px">
//             <circle cx="50" cy="50" r="36.5" fill="#fff5cf" />
//             <circle cx="39.871" cy="27.326" r="17.661" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" />
//             <path fill="#fff5cf" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M65.207,46.034	c0,0-9.183-0.471-15.215,3.486c-8.164,5.355-1.231,12.713,4.388,9.797c3.603-1.87,6.987-0.501,9.128,2.795	c2.141,3.296,5.916,3.431,11.379,1.022" /><path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M35.66,44.532	c-3.938,2.785-4.487,6.361-2.217,9.838c3.368,5.158,8.884,6.401,11.522,3.018c2.849-3.653-1.516-8.187-4.598-9.352" /><path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M93.344,46.976	c0,0-13.078-0.78-20.916-3.053c-7.194-2.087-14.047-3.758-20.492-3.771" /><path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M32.473,52.801	c0,0-5.087,3.885-0.65,9.97s12.119,5.996,14.188,1.993s-1.608-6.704-1.608-6.704" /><path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M34.091,65.1	c-0.451,0.942-1.561,6.659,5.61,9.912c6.956,3.156,14.398-4.199,5.595-9.069" /><path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M81.571,84.884	c0,0-9.771-0.706-18.562-4.554c-11.716-5.128-18.418-4.553-18.418-4.553" /><line x1="49.857" x2="51.94" y1="42.136" y2="48.231" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" /><path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M55.744,58.848	c0,0,1.43,5.096,2.42,7.819c1.698,4.669-3.995,10.003-9.04,4.886" /><path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M20.353,16.367	c-3.179,3.179-7.064,19.543,6.004,28.255" />
//         </svg>
//     )
// }

// export default SearchIcon

import React from 'react';

interface SearchIconProps {
    className?: string;
}

const SearchIcon: React.FC<SearchIconProps> = ({ className }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            width="35"
            height="35"
            strokeWidth="1"
            stroke="currentColor"
            className={className ? `size-6 ${className}` : 'size-6'}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
            />
        </svg>
    );
};

export default SearchIcon;