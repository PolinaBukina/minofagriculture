// import React from 'react';

// interface CogIconProps {
//     className?: string;
//     size?: number;
//     color?: string;
// }

// export const CogIcon: React.FC<CogIconProps> = ({
//     className = '',
//     size = 24,
//     color = 'currentColor',
// }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="50px" height="50px"><circle cx="50" cy="50" r="36.5" fill="#fff5cf" /><path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M28.41,45.725	c-3.971,6.04-3.729,11.318,1.031,13.381c5.578,2.418,10.798,0.444,11.133-3.777c0.361-4.559-5.807-5.967-8.233-5.456" /><path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M74.767,20.451	c0,0-11.193,7.515-18.918,9.797c-8.047,2.377-12.752,2.23-18.977,7.113" /><path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M90.839,53.278	c0,0-10.33,8.354-22.881,11.722c-5.896,1.582-8.426,2.17-8.426,2.17" /><path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M48.936,71.574	l2.095,2.742c-1.944,4.032-1.609,8.983,1.303,12.776c3.195,4.161,8.534,5.687,13.273,4.245l-6.443-8.392	c-1.446-1.883-1.091-4.581,0.792-6.027c1.883-1.446,4.581-1.091,6.027,0.792l6.443,8.392c2.617-4.206,2.522-9.758-0.672-13.92	c-2.912-3.793-7.608-5.396-12.006-4.56L34.372,34.569c1.944-4.033,1.609-8.983-1.303-12.776c-3.195-4.161-8.534-5.687-13.273-4.245	l6.443,8.392c1.446,1.883,1.091,4.581-0.792,6.027s-4.581,1.091-6.027-0.792l-6.443-8.392c-2.617,4.206-2.522,9.758,0.672,13.92	c2.912,3.793,7.608,5.396,12.006,4.56l6.558,8.547" /><path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M27.789,58.341	c0,0-1.36,5.705,5.604,8.305c6.963,2.6,11.772-1.488,11.521-5.381c-0.215-3.347-4.004-4.604-4.004-4.604" /><path fill="none" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M35.826,67.843	c0.14,1.021,2.316,6.084,9.992,4.865c7.446-1.182,6.358-9.664-0.842-10.034" /><path fill="#fff5cf" stroke="#231f20" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M43.078,40.522	c0,0-7.12,5.626-9.022,12.489c-2.573,9.287,7.36,10.235,9.631,4.414c1.457-3.733,3.497-4.129,7.355-3.723	c4.085,0.43,7.617,1.442,10.979-3.191" /></svg>
// );


import React from 'react';

interface CogIconProps {
    className?: string;
}

export const CogIcon: React.FC<CogIconProps> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        width="30"
        height="30"
        viewBox="0 0 24 24"
        strokeWidth="1"
        stroke="currentColor"
        className={`size-6 ${className || ''}`}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"
        />
    </svg>
);