import React from "react";
import { AiFillFacebook, AiFillInstagram, AiFillYoutube, AiOutlineTwitter } from "react-icons/ai";
import { Typography, Divider } from "@mui/material";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import {
  footercompanyLinks,
  footerProductLinks,
  footerSupportLinks,
} from "@fuse/sitestaticdata/data";
import { Link } from "react-router-dom";

const FooterAfricanshops = () => {
  return (
    <footer
      className="text-white"
      style={{
        background: "linear-gradient(to bottom right, #111827, #1f2937, #000000)",
      }}
    >
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 md:px-12 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link
              to="/"
              className="inline-flex items-center space-x-3 group"
              style={{ textDecoration: "none" }}
            >
              <img
                src="assets/images/afslogo/afslogo.png"
                width={48}
                height={48}
                alt="Africanshops Logo"
                className="transition-transform group-hover:scale-110 duration-300"
              />
              <Typography className="text-xl font-bold text-white hover:text-orange-500 transition-colors duration-300">
                Africanshops
              </Typography>
            </Link>

            <Typography className="text-gray-400 leading-relaxed max-w-xs">
              Nurturing African businesses and ideologies. Your gateway to authentic African
              commerce.
            </Typography>

            {/* Social Media Icons */}
            <div className="flex items-center space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-all duration-300 transform hover:scale-110"
                aria-label="Facebook"
              >
                <AiFillFacebook size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-all duration-300 transform hover:scale-110"
                aria-label="Twitter"
              >
                <AiOutlineTwitter size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-all duration-300 transform hover:scale-110"
                aria-label="Instagram"
              >
                <AiFillInstagram size={20} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-all duration-300 transform hover:scale-110"
                aria-label="YouTube"
              >
                <AiFillYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <Typography variant="h6" className="font-bold text-white mb-6">
              Company
            </Typography>
            <ul className="space-y-3">
              {footerProductLinks.map((link, index) => (
                <li key={index}>
                  <Typography
                    className="text-gray-400 hover:text-orange-500 hover:pl-2 duration-300 text-sm cursor-pointer transition-all"
                    component={NavLinkAdapter}
                    to={link.link}
                  >
                    {link.name}
                  </Typography>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop Links */}
          <div className="space-y-4">
            <Typography variant="h6" className="font-bold text-white mb-6">
              Shop
            </Typography>
            <ul className="space-y-3">
              {footercompanyLinks.map((link, index) => (
                <li key={index}>
                  <Typography
                    className="text-gray-400 hover:text-orange-500 hover:pl-2 duration-300 text-sm cursor-pointer transition-all"
                    component={NavLinkAdapter}
                    to={link.link}
                  >
                    {link.name}
                  </Typography>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <Typography variant="h6" className="font-bold text-white mb-6">
              Support
            </Typography>
            <ul className="space-y-3">
              {footerSupportLinks.map((link, index) => (
                <li key={index}>
                  <Typography
                    className="text-gray-400 hover:text-orange-500 hover:pl-2 duration-300 text-sm cursor-pointer transition-all"
                    component={NavLinkAdapter}
                    to={link.link}
                  >
                    {link.name}
                  </Typography>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Divider */}
      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />

      {/* Bottom Footer */}
      <div className="container mx-auto px-6 md:px-12 lg:px-16 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright */}
          <Typography className="text-gray-400 text-sm text-center md:text-left">
            © {new Date().getFullYear()} Africanshops. All rights reserved.
          </Typography>

          {/* Legal Links */}
          <div className="flex items-center space-x-6">
            <Link
              to="/terms"
              className="text-gray-400 hover:text-orange-500 text-sm transition-colors duration-300"
            >
              Terms
            </Link>
            <Link
              to="/privacy"
              className="text-gray-400 hover:text-orange-500 text-sm transition-colors duration-300"
            >
              Privacy Policy
            </Link>
            <Link
              to="/careers"
              className="text-gray-400 hover:text-orange-500 text-sm transition-colors duration-300"
            >
              Careers
            </Link>
          </div>

          {/* Payment Methods */}
          <div className="flex items-center space-x-3">
            <img
              src="https://hamart-shop.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffooter-payment.a37c49ac.png&w=640&q=75"
              alt="Payment Methods"
              className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterAfricanshops;
