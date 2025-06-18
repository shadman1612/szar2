import React from "react";

const ContactUs = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <p>
        If you have any questions or would like to get in touch, feel free to email us at:{" "}
        <a href="mailto:szarservice@gmail.com" className="text-blue-500 underline">
          szarservice@gmail.com
        </a>
      </p>
    </div>
  );
};

export default ContactUs;
