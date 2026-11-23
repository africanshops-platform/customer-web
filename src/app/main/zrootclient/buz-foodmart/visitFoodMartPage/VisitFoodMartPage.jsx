import _ from "@lodash";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import { Button, FormControlLabel } from "@mui/material";
import FusePageSimple from "@fuse/core/FusePageSimple";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import FuseLoading from "@fuse/core/FuseLoading";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { Link, useParams } from "react-router-dom";
import { useGetMartMenu } from "app/configs/data/server-calls/auth/userapp/a_foodmart/useFoodMartsRepo";
import { formatCurrency } from "../../../vendors-shop/PosUtils";
import ClienttErrorPage from "../../components/ClienttErrorPage";
import FoodMartMapSingle from "../components/maps/FoodMartMapSingle";
import { isItemAvailable, NOT_AVAILABLE_LABEL, NOT_AVAILABLE_NOTE, unavailableLook } from "../../shared/itemAvailability";

const container = {
  show: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};
const item = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  show: {
    opacity: 1,
    y: 0,
  },
};

/**
 * The Courses page.
 */
function VisitFoodMartPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));

  const routeParams = useParams();
  const { martId } = routeParams;
  const { data: martMenu, isLoading, isError } = useGetMartMenu(martId);

  console.log("SINGLE____FOOD___MART", martMenu?.data?.foodMart);

  if (isLoading) {
    return <FuseLoading />;
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <ClienttErrorPage message={"Error occurred while retriving menu"} />
      </motion.div>
    );
  }

  if (!martMenu?.data?.data?.menu) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <Typography color="text.secondary" variant="h5">
          No products products
        </Typography>
      </motion.div>
    );
  }

  return (
    <FusePageSimple
      content={
        <>
          <div className="h-screen flex flex-col md:mx-64 mt-20">
            <div className="flex flex-1 flex-col md:flex-row gap-4">
              {/* left shop details bar */}
              <div className="w-full md:w-1/4 relative  mt-4 md:mt-0 md:sticky top-16 h-[500px] overflow-scroll">
                <div className="w-full md:w-full bg-white p-4">
                  <div className="flex flex-col items-center">
                    <img
                      src={martMenu?.data?.foodMart?.imageSrc}
                      alt="Store logo"
                      className="rounded-full mb-4 h-[100px]"
                    />
                    <div className="text-center">
                      <p className="text-gray-500">Since 2023</p>
                      <h2 className="text-xl font-bold">{martMenu?.data?.foodMart?.title}</h2>
                      <p className="text-gray-500">
                        {martMenu?.data?.data?.menu?.length} items in menu
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <button className="bg-gray-100 p-2 rounded-lg flex items-center justify-center">
                      <i className="fas fa-ticket-alt text-xl"></i>
                      <span className="ml-2">Coupons</span>
                    </button>
                    <button className="bg-gray-100 p-2 rounded-lg flex items-center justify-center">
                      <i className="fas fa-address-book text-xl"></i>
                      <span className="ml-2">Contact</span>
                    </button>
                    <button className="bg-gray-100 p-2 rounded-lg flex items-center justify-center">
                      <i className="fas fa-globe text-xl"></i>
                      <span className="ml-2">Website</span>
                    </button>
                    <button className="bg-gray-100 p-2 rounded-lg flex items-center justify-center">
                      <i className="fas fa-file-alt text-xl"></i>
                      <span className="ml-2">Terms</span>
                    </button>
                    <button className="bg-gray-100 p-2 rounded-lg flex items-center justify-center">
                      <i className="fas fa-question-circle text-xl"></i>
                      <span className="ml-2">FAQs</span>
                    </button>
                  </div>
                  <div className="mt-6">
                    <h3 className="font-bold">Address</h3>
                    <p className="text-gray-500">
                      East Avenue 1743, West Tower, New York, Manhattan, 12332, United States
                    </p>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-bold">Phone</h3>
                    {/* <p className="text-gray-500">8139982265</p> */}
                  </div>
                </div>
              </div>

              {/* Main Content */}

              <main className="mt-10 flex-1 p-4 rounded-md">
                <div className=" bg-white flex flex-col md:flex-row justify-between items-center mb-4 p-4">
                  <Typography className="text-[12px] font-bold">
                    Menu at ({martMenu?.data?.foodMart?.title})
                  </Typography>
                  <div className="flex space-x-4 mt-4 md:mt-0">
                    <select className="border rounded px-4 py-2">
                      <option> Categories</option>
                      <option> Drinks</option>
                      <option> Deserts</option>
                      <option> Swallows</option>
                    </select>
                    {/* <button className="border rounded px-4 py-2">Brand</button>
                    <button className="border rounded px-4 py-2">Price</button> */}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-8">
                  {martMenu?.data?.data?.menu?.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded shadow flex flex-col justify-between"
                    >
                      <div className="relative h-[150px]">
                        <img
                          src={item?.imageSrc}
                          alt={item?.title || "Menu item"}
                          className="w-full h-[150px] rounded-8 transition ease-in-out delay-150  hover:scale-105 object-cover"
                          style={isItemAvailable(item) ? undefined : unavailableLook}
                        />
                        {isItemAvailable(item) ? (
                          <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
                            Black Friday deal
                          </span>
                        ) : (
                          <span
                            data-testid="not-available-badge"
                            className="absolute top-2 left-2 bg-gray-700 text-white text-xs px-2 py-1 rounded"
                          >
                            {NOT_AVAILABLE_LABEL}
                          </span>
                        )}
                      </div>
                      <div className="mt-4 flex flex-col">
                        <div className=" justify-between">
                          <Typography className="bg-blue-500 text-white text-xs px-2 py-1 rounded w-fit">
                            Official Store
                          </Typography>

                          <Typography
                            className="mt-2 text-sm font-bold cursor-pointer"
                            component={NavLinkAdapter}
                            to={`/foodmarts/menu/${item?.slug}`}
                          >
                            {item?.title}
                          </Typography>
                          <p className="text-orange-500 font-bold mt-2">
                            ₦ {formatCurrency(item?.price)}{" "}
                            <span className="text-sm">/ {item?.unitPerQuantity} </span>
                          </p>
                          {item?.listprice && (
                            <p className="text-gray-500 line-through">
                              ₦ {formatCurrency(item?.listprice)}
                            </p>
                          )}
                          {item?.listprice && <p className="text-green-500">-70%</p>}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <i className="far fa-heart text-xl"></i>
                        {!isItemAvailable(item) && (
                          <span data-testid="not-available-note" className="text-xs text-gray-600 mr-2">
                            {NOT_AVAILABLE_NOTE}
                          </span>
                        )}
                        <Button
                          size="xs"
                          disabled={!isItemAvailable(item)}
                          className="bg-orange-400 hover:bg-orange-800 text-black px-4 py-2 rounded w-full"
                        >
                          {isItemAvailable(item) ? "ADD TO CART" : NOT_AVAILABLE_LABEL}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <br />
                <br />
                <br />
                <br />
                <br />
              </main>

              {/* Map */}
              <div className="w-full md:w-1/4 bg-gray-200 relative  mt-4 md:mt-0 md:sticky top-16 h-screen">
                {/* <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                  <div className="bg-white p-4 rounded-lg shadow-lg">
                    <p className="text-gray-700 mb-4">
                      This page can't load Google Maps correctly.
                    </p>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                      OK
                    </button>
                  </div>
                </div>
                <img
                  src="https://placehold.co/400x600"
                  alt="Map placeholder"
                  className="w-full h-full object-cover"
                /> */}

                <FoodMartMapSingle
                  center={martMenu?.data?.foodMart?.foodMartState}
                  items={martMenu?.data?.data?.menu}
                />
              </div>
            </div>
          </div>
        </>
      }
      scroll={isMobile ? "normal" : "page"}
    />
  );
}

export default VisitFoodMartPage;
