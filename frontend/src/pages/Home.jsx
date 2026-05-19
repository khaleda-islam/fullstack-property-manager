import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Home() {
  const [features, setFeatures] = useState([]);
  const [roles, setRoles] = useState([]);
  const [docs, setDocs] = useState([]);

  // fetch function
  useEffect(() => {
    fetch("/mockData/home.json")
      .then((response) => response.json())
      .then((data) => {
        setFeatures(data.features);
        setRoles(data.roles);
        setDocs(data.docs);
      })
      .catch((error) => console.error("Error fetching home data:", error));
  }, []);

  return (
    <div className="bg-white">
      {/* 1. HERO SECTION (Split Layout) */}
      <section
        className="py-5"
        style={{
          background: "linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)",
        }}
      >
        <div className="container py-5">
          <div className="row align-items-center gy-5">
            <div className="col-lg-6 pe-lg-5">
              <div className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 mb-3 fw-semibold">
                v2.0 Now Live
              </div>
              <h1 className="display-4 fw-bold mb-4">
                The All-in-One{" "}
                <span className="text-gradient">Property Management</span>{" "}
                Platform
              </h1>
              <p className="lead text-secondary mb-4 pe-md-5">
                Automate rent collection, instantly route maintenance requests,
                and keep your properties profitable with a modern, friction-free
                dashboard.
              </p>
              <div className="d-flex gap-3 flex-column flex-sm-row">
                <Link
                  to="/signup"
                  className="btn btn-primary btn-lg fw-semibold px-4 py-3 shadow-sm"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/contact"
                  className="btn btn-outline-secondary btn-lg fw-semibold px-4 py-3"
                >
                  Book a Demo
                </Link>
              </div>
            </div>

            {/* Mock Dashboard Preview */}
            <div className="col-lg-6">
              <div className="mock-dashboard p-1">
                <div className="bg-light rounded-top px-3 py-2 border-bottom d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle bg-danger"
                    style={{ width: "10px", height: "10px" }}
                  ></div>
                  <div
                    className="rounded-circle bg-warning"
                    style={{ width: "10px", height: "10px" }}
                  ></div>
                  <div
                    className="rounded-circle bg-success"
                    style={{ width: "10px", height: "10px" }}
                  ></div>
                </div>
                <div className="p-4 bg-white" style={{ minHeight: "300px" }}>
                  <div className="d-flex justify-content-between mb-4">
                    <div className="w-50 bg-light rounded p-3 border">
                      <small className="text-muted fw-bold">
                        Monthly Revenue
                      </small>
                      <h3 className="mb-0 mt-2">$24,500</h3>
                    </div>
                    <div className="w-50 bg-light rounded p-3 border ms-3">
                      <small className="text-muted fw-bold">Open Tickets</small>
                      <h3 className="mb-0 mt-2 text-danger">3</h3>
                    </div>
                  </div>
                  <div
                    className="w-100 bg-light rounded"
                    style={{ height: "20px", marginBottom: "10px" }}
                  ></div>
                  <div
                    className="w-75 bg-light rounded"
                    style={{ height: "20px", marginBottom: "10px" }}
                  ></div>
                  <div
                    className="w-100 bg-light rounded"
                    style={{ height: "20px" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST & CREDIBILITY */}
      <section className="py-4 border-top border-bottom bg-light bg-opacity-50">
        <div className="container text-center">
          <p className="text-muted fw-semibold small mb-3 text-uppercase tracking-wide">
            Trusted by modern property managers
          </p>
          <div className="d-flex justify-content-center flex-wrap gap-4 gap-md-5 align-items-center opacity-50">
            <h5 className="mb-0 fw-bold">
              <i className="bi bi-buildings-fill me-2"></i>UrbanEstates
            </h5>
            <h5 className="mb-0 fw-bold">
              <i className="bi bi-house-check-fill me-2"></i>Skyline Living
            </h5>
            <h5 className="mb-0 fw-bold">
              <i className="bi bi-shield-check me-2"></i>99.9% Uptime
            </h5>
            <h5 className="mb-0 fw-bold">
              <i className="bi bi-door-open-fill me-2"></i>500+ Units
            </h5>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS*/}
      <section className="py-5 my-5 container">
        <div className="text-center mb-5">
          <h2 className="fw-bold">From Onboarding to Automation</h2>
          <p className="text-muted">
            Three simple steps to streamline your real estate portfolio.
          </p>
        </div>
        <div className="row g-4 text-center">
          <div className="col-md-4">
            <div
              className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow"
              style={{ width: "60px", height: "60px", fontSize: "1.5rem" }}
            >
              1
            </div>
            <h5 className="fw-bold">Add Properties</h5>
            <p className="text-muted small px-3">
              Upload your units, set rent amounts, and attach existing lease
              documents.
            </p>
          </div>
          <div className="col-md-4">
            <div
              className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow"
              style={{ width: "60px", height: "60px", fontSize: "1.5rem" }}
            >
              2
            </div>
            <h5 className="fw-bold">Invite Residents</h5>
            <p className="text-muted small px-3">
              Tenants receive a secure link to create their portal and set up
              payment methods.
            </p>
          </div>
          <div className="col-md-4">
            <div
              className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow"
              style={{ width: "60px", height: "60px", fontSize: "1.5rem" }}
            >
              3
            </div>
            <h5 className="fw-bold">Track & Resolve</h5>
            <p className="text-muted small px-3">
              Monitor incoming rent, dispatch contractors for repairs, and track
              analytics.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION (Cards) */}
      <section className="py-5 bg-light">
        <div className="container py-4">
          <h2 className="fw-bold text-center mb-5">
            Enterprise Features, Built for Everyone
          </h2>
          <div className="row g-4">
            {features.map((feat, idx) => (
              <div className="col-md-4" key={idx}>
                <div className="card h-100 border-0 shadow-sm p-4 hover-lift rounded-4">
                  <i
                    className={`bi ${feat.icon} text-primary mb-3`}
                    style={{ fontSize: "2rem" }}
                  ></i>
                  <h5 className="fw-bold">{feat.title}</h5>
                  <p className="text-muted mb-0">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ROLE-BASED VALUE */}
      <section className="py-5 container my-5">
        <h2 className="fw-bold text-center mb-5">
          One Platform. Three Experiences.
        </h2>
        <div className="row g-4">
          {roles.map((role, idx) => (
            <div className="col-md-4" key={idx}>
              <div className="border rounded-4 p-4 h-100 bg-white shadow-sm">
                <h6 className="text-primary fw-bold text-uppercase mb-3">
                  <i className={`bi ${role.icon} me-2`}></i>
                  {role.target}
                </h6>
                <ul className="list-unstyled mb-0">
                  {role.benefits.map((benefit, bIdx) => (
                    <li key={bIdx} className="mb-2 text-secondary">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. DOCUMENTATION SECTION */}
      <section className="py-5 bg-dark text-white">
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <h2 className="fw-bold mb-1">User Documentation</h2>
              <p className="text-dark opacity-75 mb-0">
                Learn how to maximize your PropertyPulse dashboard.
              </p>
            </div>
            <Link to="/docs" className="btn btn-outline-dark d-none d-md-block">
              View Help Center
            </Link>
          </div>

          <div className="row g-3">
            {docs.map((doc, idx) => (
              <div className="col-md-6 col-lg-3" key={idx}>
                <Link to={`/docs/${idx}`} className="text-decoration-none">
                  <div className="card bg-white bg-opacity-10 border-0 text-black h-100 p-3 hover-lift">
                    <i className={`bi ${doc.icon} mb-2 fs-4 text-info`}></i>
                    <h6 className="fw-bold">{doc.title}</h6>
                    <small className="opacity-75">{doc.desc}</small>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-white py-5 border-top">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-4 pe-lg-5">
              <h5 className="fw-bold mb-3">PropertyPulse</h5>
              <p className="text-muted small">
                Connecting landlords, residents, and contractors in one seamless
                platform. Built for the modern real estate portfolio.
              </p>
            </div>
            <div className="col-6 col-lg-2 offset-lg-2">
              <h6 className="fw-bold mb-3">Product</h6>
              <ul className="list-unstyled text-muted small">
                <li className="mb-2">
                  <Link
                    to="/features"
                    className="text-decoration-none text-muted"
                  >
                    Features
                  </Link>
                </li>
                <li className="mb-2">
                  <Link
                    to="/pricing"
                    className="text-decoration-none text-muted"
                  >
                    Pricing
                  </Link>
                </li>
                <li className="mb-2">
                  <Link
                    to="/security"
                    className="text-decoration-none text-muted"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-6 col-lg-2">
              <h6 className="fw-bold mb-3">Resources</h6>
              <ul className="list-unstyled text-muted small">
                <li className="mb-2">
                  <Link to="/docs" className="text-decoration-none text-muted">
                    Documentation
                  </Link>
                </li>
                <li className="mb-2">
                  <Link
                    to="/guides"
                    className="text-decoration-none text-muted"
                  >
                    Landlord Guides
                  </Link>
                </li>
                <li className="mb-2">
                  <Link
                    to="/contact"
                    className="text-decoration-none text-muted"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-lg-2">
              <h6 className="fw-bold mb-3">Connect</h6>
              <div className="d-flex gap-3">
                <a href="#" className="text-muted fs-5">
                  <i className="bi bi-twitter-x"></i>
                </a>
                <a href="#" className="text-muted fs-5">
                  <i className="bi bi-linkedin"></i>
                </a>
                <a href="#" className="text-muted fs-5">
                  <i className="bi bi-github"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="border-top mt-5 pt-4 text-center text-muted small">
            &copy; {new Date().getFullYear()} Property Management System Team 6.
            All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
