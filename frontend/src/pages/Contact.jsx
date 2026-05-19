// frontend/src/pages/Contact.jsx
import React from 'react';

const Contact = () => {
  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-dark mb-3">Contact Us</h1>
          <p className="lead text-secondary">Have questions? We'd love to hear from you. Reach out to us through any of the channels below.</p>
        </div>

        <div className="row g-4 justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-sm border-0 h-100 hover-card">
              <div className="card-body text-center p-4">
                <h3 className="card-title h4 mb-3">📧 Email</h3>
                <p className="card-text text-secondary">support@propertymanagement.com</p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-5">
            <div className="card shadow-sm border-0 h-100 hover-card">
              <div className="card-body text-center p-4">
                <h3 className="card-title h4 mb-3">📞 Phone</h3>
                <p className="card-text text-secondary">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-5">
            <div className="card shadow-sm border-0 h-100 hover-card">
              <div className="card-body text-center p-4">
                <h3 className="card-title h4 mb-3">📍 Address</h3>
                <p className="card-text text-secondary">
                  123 Property Street<br/>
                  Suite 100<br/>
                  City, State 12345
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-5">
            <div className="card shadow-sm border-0 h-100 hover-card">
              <div className="card-body text-center p-4">
                <h3 className="card-title h4 mb-3">🕒 Business Hours</h3>
                <p className="card-text text-secondary">
                  Monday - Friday: 9:00 AM - 6:00 PM<br/>
                  Saturday: 10:00 AM - 4:00 PM<br/>
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
