// import React from 'react';

// interface MonitorIconProps {
//     className?: string;
// }

// export const MonitorIcon: React.FC<MonitorIconProps> = ({ className }) => (
//     <svg
//         xmlns="http://www.w3.org/2000/svg"
//         width="100"
//         height="100"
//         viewBox="0 0 256 256"
//         className={className}
//     >
//         <g
//             fill="none"
//             fillRule="nonzero"
//             stroke="none"
//             strokeWidth="1"
//             // strokeLinecap="none"
//             // strokeLinejoin="none"
//             strokeMiterlimit="10"
//             strokeDasharray=""
//             strokeDashoffset="0"
//             fontFamily="none"
//             fontWeight="none"
//             fontSize="none"
//             textAnchor="none"
//             style={{ mixBlendMode: 'normal' }}
//         >
//             <g transform="scale(2.56,2.56)">
//                 <circle cx="50" cy="50" r="36.5" fill="#ece9ff" stroke="none" strokeLinecap="butt" strokeLinejoin="miter"></circle>
//                 <path d="M45.264,33.64c0.347,-0.296 0.698,-0.565 1.051,-0.802c5.245,-3.517 1.397,-8.058 -2.51,-6.643c-5.261,1.904 -9.558,6.754 -11.394,12.886" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round"></path>
//                 <path d="M33.808,80.018c0,0 3.332,-9.909 17.188,-13.943c6.637,-1.587 6.271,-7.151 1.928,-8.391" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round"></path>
//                 <path d="M24.402,42.938c0,0 -0.211,-10.123 3.399,-17.705c2.631,-5.525 9.208,-1.666 6.665,3.069c-2.218,4.129 -2.077,10.801 -2.077,10.801" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round"></path>
//                 <path d="M24.367,42.861c0,0 -1.302,-4.358 -1.599,-9.862c-0.228,-4.236 -5.869,-5.812 -6.981,-0.4c-1.315,6.402 3.595,14.557 1.842,21.66c-1.753,7.103 -7.454,14.82 -7.454,14.82" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round"></path>
//                 <circle cx="43.554" cy="52.166" r="10.332" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round"></circle>
//                 <circle cx="79.493" cy="52.166" r="10.332" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round"></circle>
//                 <path d="M89.039,48.01l-5.636,-19.153c-0.919,-3.124 -3.727,-5.417 -6.983,-5.443c-0.024,0 -0.048,0 -0.072,0c-4.962,0 -8.985,4.023 -8.985,8.985l1.797,20.216" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round"></path>
//                 <path d="M34.007,48.01v0c1.521,-5.168 4.719,-9.684 9.09,-12.833l2.141,-1.542" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round"></path>
//                 <path d="M53.886,52.166l1.797,-19.767c0,-4.962 -4.023,-8.985 -8.985,-8.985c-0.024,0 -0.048,0 -0.072,0c-3,0.023 -5.62,1.972 -6.732,4.722" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round"></path>
//                 <circle cx="61.523" cy="46.775" r="6.739" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round"></circle>
//                 <path d="M67.484,29.254c-1.13,-2.137 -3.375,-3.594 -5.961,-3.594c-2.806,0 -5.212,1.716 -6.226,4.155" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round"></path>
//                 <circle cx="61.523" cy="46.775" r="3.145" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round"></circle>
//                 <path d="M42.719,24.571c0.81,-2.866 3.521,-4.816 6.489,-4.568c0.107,0.009 0.213,0.019 0.32,0.031c3.279,0.369 5.657,3.315 5.463,6.609l-0.206,1.713" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round"></path>
//                 <path d="M80.432,24.571c-0.81,-2.866 -3.521,-4.816 -6.489,-4.568c-0.107,0.009 -0.213,0.019 -0.32,0.031c-3.279,0.369 -5.657,3.315 -5.463,6.609l0.206,1.713" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round"></path>
//                 <path d="M43.5,45.5c-3.866,0 -7,3.134 -7,7" fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round"></path>
//             </g>
//         </g>
//     </svg>
// );



import React from 'react';

interface MonitorIconProps {
    className?: string;
}

export const MonitorIcon: React.FC<MonitorIconProps> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        width="100"
        height="100"
        viewBox="0 0 24 24"
        strokeWidth="1"
        stroke="currentColor"
        className={className ? `size-6 ${className}` : 'size-6'}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m3.75 7.5 16.5-4.125M12 6.75c-2.708 0-5.363.224-7.948.655C2.999 7.58 2.25 8.507 2.25 9.574v9.176A2.25 2.25 0 0 0 4.5 21h15a2.25 2.25 0 0 0 2.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169A48.329 48.329 0 0 0 12 6.75Zm-1.683 6.443-.005.005-.006-.005.006-.005.005.005Zm-.005 2.127-.005-.006.005-.005.005.005-.005.005Zm-2.116-.006-.005.006-.006-.006.005-.005.006.005Zm-.005-2.116-.006-.005.006-.005.005.005-.005.005ZM9.255 10.5v.008h-.008V10.5h.008Zm3.249 1.88-.007.004-.003-.007.006-.003.004.006Zm-1.38 5.126-.003-.006.006-.004.004.007-.006.003Zm.007-6.501-.003.006-.007-.003.004-.007.006.004Zm1.37 5.129-.007-.004.004-.006.006.003-.004.007Zm.504-1.877h-.008v-.007h.008v.007ZM9.255 18v.008h-.008V18h.008Zm-3.246-1.87-.007.004L6 16.127l.006-.003.004.006Zm1.366-5.119-.004-.006.006-.004.004.007-.006.003ZM7.38 17.5l-.003.006-.007-.003.004-.007.006.004Zm-1.376-5.116L6 12.38l.003-.007.007.004-.004.007Zm-.5 1.873h-.008v-.007h.008v.007ZM17.25 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Zm0 4.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
        />
    </svg>
);