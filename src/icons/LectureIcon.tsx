import React from 'react';

interface LectureIconProps {
    className?: string;
}

export const LectureIcon: React.FC<LectureIconProps> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100"
        height="100"
        viewBox="0 0 256 256"
        className={className}
    >
        <g
            fill="none"
            fillRule="nonzero"
            stroke="none"
            strokeWidth="1"
            // strokeLinecap="none"
            // strokeLinejoin="none"
            strokeMiterlimit="10"
            strokeDasharray=""
            strokeDashoffset="0"
            fontFamily="none"
            fontWeight="none"
            fontSize="none"
            textAnchor="none"
            style={{ mixBlendMode: 'normal' }}
        >
            <g transform="scale(2.56,2.56)">
                <circle cx="50" cy="50" r="36.5" fill="#e9fdf5" stroke="none" strokeLinecap="butt" strokeLinejoin="miter"></circle>
                <path d="M32.298,16.048c0.139,9.708 1.896,26.607 3.128,29.812c2.716,7.066 7.024,4.15 7.024,4.15" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M41.517,43.337c0,0 0.28,13.888 9.747,10.029" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M68.5,46.5c1.318,-1.926 2.022,-3.751 2.583,-5.49c1.571,-4.873 -3.415,-14.899 -3.147,-27.786" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M50.832,47.375c0,0 0.598,13.972 2.499,18.969c1.901,4.997 7.909,4.62 8.702,-1.62c0.793,-6.24 0.502,-18.143 2.704,-26.486" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M34.5,41.5h-3l-0.2,53.5l18.7,-12.1l18.7,12.1l-0.2,-53.5h-4.25" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round"></path>
            </g>
        </g>
    </svg>
);