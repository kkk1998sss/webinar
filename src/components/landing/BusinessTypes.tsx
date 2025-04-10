import React from 'react';
import {
  FaBookOpen,
  FaBriefcase,
  FaBullhorn,
  FaCalculator,
  FaChalkboardTeacher,
  FaEllipsisH,
  FaHome,
  FaLaptopCode,
  FaThumbsUp,
  FaTooth,
  FaUserMd,
  FaUserTie,
} from 'react-icons/fa';

const businessTypes = [
  { icon: <FaChalkboardTeacher size={30} />, label: 'Coaches' },
  { icon: <FaBookOpen size={30} />, label: 'Course Creators' },
  { icon: <FaLaptopCode size={30} />, label: 'SaaS Businesses' },
  { icon: <FaHome size={30} />, label: 'Real Estate' },
  { icon: <FaBullhorn size={30} />, label: 'Marketing Agencies' },
  { icon: <FaBriefcase size={30} />, label: 'Professional Services' },
  { icon: <FaUserTie size={30} />, label: 'Consultants' },
  { icon: <FaCalculator size={30} />, label: 'Accountants' },
  { icon: <FaThumbsUp size={30} />, label: 'Chiropractors' },
  { icon: <FaUserMd size={30} />, label: 'Doctors' },
  { icon: <FaTooth size={30} />, label: 'Dentists' },
  { icon: <FaEllipsisH size={30} />, label: 'Many More' },
];

const BusinessTypes = () => {
  return (
    <section className="w-full bg-gray-900 px-6 py-40 text-center text-white">
      <p className="mb-2 text-sm uppercase tracking-wide text-yellow-300">
        Endless Use Cases
      </p>
      <h2 className="mb-4 text-3xl font-bold md:text-4xl">
        All types of businesses can massively benefit from WebinarKit
      </h2>
      <p className="mb-12 text-lg text-gray-400">
        Automating your business has never been this easy
      </p>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {businessTypes.map((type, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="mb-3 text-teal-400">{type.icon}</div>
            <p className="text-sm text-white">{type.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BusinessTypes;
