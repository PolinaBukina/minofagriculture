import React from 'react';

interface CheckCircleIconProps {
    className?: string;
    size?: number;
    color?: string;
}

export const CheckCircleIcon: React.FC<CheckCircleIconProps> = ({
    className = '',
    size = 24,
    color = 'currentColor',
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        width="24px"
        height="24px"
        baseProfile="basic">
        <path
            // fill="#f0ffd2" 
            fill="#86ff9c"
            d="M86.5,50c0,20.158-17.122,33.537-37.28,33.537s-36.5-16.342-36.5-36.5S29.842,13.5,50,13.5	S86.5,29.842,86.5,50z" /><path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M61.457,13.873	c-6.065-1.504-10.273-1.092-12.882,0.291c-4.521,2.396-7.587,8.062-3.281,13.255s11.792,0.467,9.997-4.456s-2.838-5.443-2.838-5.443" /><path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M99.391,37.276	c0,0-6.056-8.293-21.515-16.641c-1.19-0.643-2.344-1.239-3.461-1.791" /><line x1="68.451" x2="55.457" y1="4.062" y2="23.017" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" /><line x1="69.819" x2="79.441" y1="25.536" y2="11.605" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" /><polyline fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" points="50.889,29.679 41.863,42.845 39.699,57.11 52.436,50.701 62.201,36.565" /><ellipse cx="74.05" cy="7.772" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" rx="2.179" ry="6.674" transform="rotate(-56.337 74.053 7.771)" /><ellipse cx="74.05" cy="7.772" fill="#231f20" rx=".638" ry="1.955" transform="rotate(-56.337 74.053 7.771)" /><path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M54.551,47.74	c0,0,5.212,1.015,9.851-1.135c3.709-1.719,6.257-8.785-2.092-10.035" /><path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M51.606,51.208	c0.104,1.654,1.713,5.008,6.768,5.132c3.749,0.092,6.546-1.326,8.41-3.43c1.497-1.69,2.25-5.238-1.428-6.838" /><path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M78.04,74.629	c-3.024-7.813-6.932-14.449-12.53-20.276" /><path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M73.142,26.251	c0,0-1.253-0.426-3.15-0.725c-2.469-0.389-6.029-0.561-9.335,0.704c-5.845,2.237-4.484,9.92,1.228,10.242	c5.712,0.322,10.022,2.451,10.022,2.451s-1.779,8.112,5.879,12.49" /><path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M41.812,43.014	c0,0,2.631,4.841,6.388,6.298" /><path fill="#231f20" d="M40.025,51.958c0,0,1.394,2.385,4.408,3.241c-3.822,1.633-4.734,1.91-4.734,1.91L40.025,51.958z" /><path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M39.699,57.11	c-11.963,8.286-21.272,21.272-21.272,21.272S13.606,70.824,5.63,65.585" />
    </svg>
);