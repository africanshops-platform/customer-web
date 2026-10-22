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
import { Avatar, AvatarGroup, Button, FormControlLabel, Paper } from "@mui/material";
import FusePageSimple from "@fuse/core/FusePageSimple";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import FuseLoading from "@fuse/core/FuseLoading";
import CourseCard from "./CourseCard";
import { useGetAcademyCategoriesQuery, useGetAcademyCoursesQuery } from "../AcademyApi";
import VisitorsOverviewWidget from "src/app/main/dashboards/analytics/widgets/VisitorsOverviewWidget";
import ConversionsWidget from "src/app/main/dashboards/analytics/widgets/ConversionsWidget";
// import _ from '@lodash';
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
// import { motion } from 'framer-motion';
/**
 * Form Validation Schema
 */
const schema = z.object({
  name: z.string().nonempty("You must enter your name"),
  password: z
    .string()
    .nonempty("Please enter your password.")
    .min(8, "Password is too short - should be 8 chars minimum."),
});
const defaultValues = {
  name: "Brian Hughes",
  password: "",
};
/****Check */

const container = {
  show: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

// const container = {
// 	show: {
// 		transition: {
// 			staggerChildren: 0.04
// 		}
// 	}
// };
const items = {
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
function Courses() {
  // const { data: courses, isLoading } = useGetAcademyCoursesQuery();
  // const { data: categories } = useGetAcademyCategoriesQuery();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  // const [filteredData, setFilteredData] = useState(courses);
  // const [searchText, setSearchText] = useState('');
  // const [selectedCategory, setSelectedCategory] = useState('all');
  // const [hideCompleted, setHideCompleted] = useState(false);
  // useEffect(() => {
  // 	function getFilteredArray() {
  // 		if (courses && searchText.length === 0 && selectedCategory === 'all' && !hideCompleted) {
  // 			return courses;
  // 		}

  // 		return _.filter(courses, (item) => {
  // 			if (selectedCategory !== 'all' && item.category !== selectedCategory) {
  // 				return false;
  // 			}

  // 			if (hideCompleted && item.progress.completed > 0) {
  // 				return false;
  // 			}

  // 			return item.title.toLowerCase().includes(searchText.toLowerCase());
  // 		});
  // 	}

  // 	if (courses) {
  // 		setFilteredData(getFilteredArray());
  // 	}
  // }, [courses, hideCompleted, searchText, selectedCategory]);

  // function handleSelectedCategory(event) {
  // 	setSelectedCategory(event.target.value);
  // }

  // function handleSearchText(event) {
  // 	setSearchText(event.target.value);
  // }

  // if (isLoading) {
  // 	return <FuseLoading />;
  // }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const { control, formState, handleSubmit, reset } = useForm({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(schema),
  });
  const { isValid, dirtyFields, errors } = formState;

  function onSubmit() {
    reset(defaultValues);
  }
  return (
    <FusePageSimple
      header={
        <Box
          className="relative overflow-hidden flex shrink-0 items-center justify-center px-16 py-32 md:p-64"
          sx={{
            backgroundColor: "primary.main",
            color: (theme) => theme.palette.getContrastText(theme.palette.primary.main),
          }}
        >
          <div className="flex flex-col items-center justify-center  mx-auto w-full">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0 } }}>
              <Typography color="inherit" className="text-18 font-semibold">
                AFRICANSHOPS MERCHANT
              </Typography>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0 } }}>
              <Typography
                color="inherit"
                className="text-center text-32 sm:text-48 font-extrabold tracking-tight mt-4"
              >
                What business tasks are you looking to automate?
              </Typography>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.3 } }}
            >
              <Typography
                color="inherit"
                className="text-16 sm:text-20 mt-16 sm:mt-24 opacity-75 tracking-tight max-w-md text-center"
              >
                Our merchant account packages got you covered for businesses in real estate, sales,
                logistics and will step you through the process of unboarding and managing your
                business.
              </Typography>
            </motion.div>
          </div>

          <svg
            className="absolute inset-0 pointer-events-none"
            viewBox="0 0 960 540"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMax slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g
              className="text-gray-700 opacity-25"
              fill="none"
              stroke="currentColor"
              strokeWidth="100"
            >
              <circle r="234" cx="196" cy="23" />
              <circle r="234" cx="790" cy="491" />
            </g>
          </svg>
        </Box>
      }
      // content={
      // 	<div className="flex flex-col flex-1 w-full mx-auto px-24 pt-24 sm:p-40">

      // 		<div className="flex flex-col shrink-0 sm:flex-row items-center justify-between space-y-16 sm:space-y-0">
      // 			<div className="flex flex-col sm:flex-row w-full sm:w-auto items-center space-y-16 sm:space-y-0 sm:space-x-16">
      // 				<FormControl
      // 					className="flex w-full sm:w-136"
      // 					variant="outlined"
      // 				>
      // 					<InputLabel id="category-select-label">Category</InputLabel>
      // 					<Select
      // 						labelId="category-select-label"
      // 						id="category-select"
      // 						label="Category"
      // 						value={selectedCategory}
      // 						onChange={handleSelectedCategory}
      // 					>
      // 						<MenuItem value="all">
      // 							<em> All </em>
      // 						</MenuItem>
      // 						{categories?.map((category) => (
      // 							<MenuItem
      // 								value={category.slug}
      // 								key={category.id}
      // 							>
      // 								{category.title}
      // 							</MenuItem>
      // 						))}
      // 					</Select>
      // 				</FormControl>
      // 				<TextField
      // 					label="Search for a course"
      // 					placeholder="Enter a keyword..."
      // 					className="flex w-full sm:w-256 mx-8"
      // 					value={searchText}
      // 					inputProps={{
      // 						'aria-label': 'Search'
      // 					}}
      // 					onChange={handleSearchText}
      // 					variant="outlined"
      // 					InputLabelProps={{
      // 						shrink: true
      // 					}}
      // 				/>
      // 			</div>

      // 			<FormControlLabel
      // 				label="Hide completed"
      // 				control={
      // 					<Switch
      // 						onChange={(ev) => {
      // 							setHideCompleted(ev.target.checked);
      // 						}}
      // 						checked={hideCompleted}
      // 						name="hideCompleted"
      // 					/>
      // 				}
      // 			/>
      // 		</div>
      // 		{filteredData &&
      // 			(filteredData.length > 0 ? (
      // 				<motion.div
      // 					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-32 mt-32 sm:mt-40"
      // 					variants={container}
      // 					initial="hidden"
      // 					animate="show"
      // 				>
      // 					{filteredData.map((course) => {
      // 						return (
      // 							<motion.div
      // 								variants={items}
      // 								key={course.id}
      // 							>
      // 								<CourseCard course={course} />
      // 							</motion.div>
      // 						);
      // 					})}
      // 				</motion.div>
      // 			) : (
      // 				<div className="flex flex-1 items-center justify-center">
      // 					<Typography
      // 						color="text.secondary"
      // 						className="text-24 my-24"
      // 					>
      // 						No courses found!
      // 					</Typography>
      // 				</div>
      // 			))}
      // 	</div>
      // }

      content={
        <>
          <div className="flex min-w-0 flex-auto flex-col items-center sm:justify-center md:p-32">
            <div className="flex min-w-0 flex-auto flex-col items-center sm:justify-center md:p-32">
              <Paper className="flex min-h-full w-full overflow-hidden rounded-0 sm:min-h-auto sm:w-auto sm:rounded-2xl sm:shadow md:w-full md:max-w-6xl">
                <Box
                  className="relative hidden h-full flex-auto items-center justify-center overflow-hidden p-64 md:flex lg:px-112"
                  sx={{ backgroundColor: "primary.main" }}
                >
                  <svg
                    className="pointer-events-none absolute inset-0"
                    viewBox="0 0 960 540"
                    width="100%"
                    height="100%"
                    preserveAspectRatio="xMidYMax slice"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <Box
                      component="g"
                      sx={{ color: "primary.light" }}
                      className="opacity-20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="100"
                    >
                      <circle r="234" cx="196" cy="23" />
                      <circle r="234" cx="790" cy="491" />
                    </Box>
                  </svg>
                  <Box
                    component="svg"
                    className="absolute -right-64 -top-64 opacity-20"
                    sx={{ color: "primary.light" }}
                    viewBox="0 0 220 192"
                    width="220px"
                    height="192px"
                    fill="none"
                  >
                    <defs>
                      <pattern
                        id="837c3e70-6c3a-44e6-8854-cc48c737b659"
                        x="0"
                        y="0"
                        width="20"
                        height="20"
                        patternUnits="userSpaceOnUse"
                      >
                        <rect x="0" y="0" width="4" height="4" fill="currentColor" />
                      </pattern>
                    </defs>
                    <rect
                      width="220"
                      height="192"
                      fill="url(#837c3e70-6c3a-44e6-8854-cc48c737b659)"
                    />
                  </Box>

                  <div className="relative z-10 w-full max-w-2xl">
                    <div className="text-7xl font-bold leading-none text-gray-100">
                      <div>Welcome to</div>
                      <div>our community</div>
                    </div>
                    <div className="mt-24 text-lg leading-6 tracking-tight text-gray-400">
                      Fuse helps developers to build organized and well coded dashboards full of
                      beautiful and rich modules. Join us and start building your application today.
                    </div>
                    <div className="mt-32 flex items-center">
                      <AvatarGroup
                        sx={{
                          "& .MuiAvatar-root": {
                            borderColor: "primary.main",
                          },
                        }}
                      >
                        <Avatar src="assets/images/avatars/female-18.jpg" />
                        <Avatar src="assets/images/avatars/female-11.jpg" />
                        <Avatar src="assets/images/avatars/male-09.jpg" />
                        <Avatar src="assets/images/avatars/male-16.jpg" />
                      </AvatarGroup>

                      <div className="ml-16 font-medium tracking-tight text-gray-400">
                        More than 17k people joined us, it's your turn
                      </div>
                    </div>
                    <div className="mt-32 flex items-center">
                      <AvatarGroup
                        sx={{
                          "& .MuiAvatar-root": {
                            borderColor: "primary.main",
                          },
                        }}
                      >
                        <Avatar src="assets/images/avatars/female-18.jpg" />
                        <Avatar src="assets/images/avatars/female-11.jpg" />
                        <Avatar src="assets/images/avatars/male-09.jpg" />
                        <Avatar src="assets/images/avatars/male-16.jpg" />
                      </AvatarGroup>

                      <div className="ml-16 font-medium tracking-tight text-gray-400">
                        More than 17k people joined us, it's your turn
                      </div>
                    </div>

                    <div className="mt-32 flex items-center">
                      <AvatarGroup
                        sx={{
                          "& .MuiAvatar-root": {
                            borderColor: "primary.main",
                          },
                        }}
                      >
                        <Avatar src="assets/images/avatars/female-18.jpg" />
                        <Avatar src="assets/images/avatars/female-11.jpg" />
                        <Avatar src="assets/images/avatars/male-09.jpg" />
                        <Avatar src="assets/images/avatars/male-16.jpg" />
                      </AvatarGroup>

                      <div className="ml-16 font-medium tracking-tight text-gray-400">
                        More than 17k people joined us, it's your turn
                      </div>
                    </div>

                    <div className="mt-32 flex items-center">
                      <AvatarGroup
                        sx={{
                          "& .MuiAvatar-root": {
                            borderColor: "primary.main",
                          },
                        }}
                      >
                        <Avatar src="assets/images/avatars/female-18.jpg" />
                        <Avatar src="assets/images/avatars/female-11.jpg" />
                        <Avatar src="assets/images/avatars/male-09.jpg" />
                        <Avatar src="assets/images/avatars/male-16.jpg" />
                      </AvatarGroup>

                      <div className="ml-16 font-medium tracking-tight text-gray-400">
                        More than 17k people joined us, it's your turn
                      </div>
                    </div>
                  </div>
                </Box>

                <div className="w-full px-16 py-32 ltr:border-l-1 rtl:border-r-1 sm:w-auto sm:p-48 md:p-64">
                  <div className="mx-auto w-full max-w-320 sm:mx-0 sm:w-320">
                    <img className="w-48" src="assets/images/afslogo/afslogo.png" alt="logo" />

                    <Typography className="mt-32 text-4xl font-extrabold leading-tight tracking-tight">
                      Unlock your session
                    </Typography>
                    <Typography className="font-medium">
                      Your session is locked due to inactivity
                    </Typography>

                    <form
                      name="registerForm"
                      noValidate
                      className="mt-32 flex w-full flex-col justify-center"
                      // onSubmit={handleSubmit(onSubmit)}
                    >
                      <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            className="mb-24"
                            label="Full name"
                            autoFocus
                            type="name"
                            error={!!errors.name}
                            helperText={errors?.name?.message}
                            variant="outlined"
                            fullWidth
                            disabled
                          />
                        )}
                      />

                      <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            className="mb-24"
                            label="Password"
                            type="password"
                            error={!!errors.password}
                            helperText={errors?.password?.message}
                            variant="outlined"
                            required
                            fullWidth
                          />
                        )}
                      />

                      <Button
                        variant="contained"
                        color="secondary"
                        className=" mt-4 w-full"
                        aria-label="Register"
                        disabled={_.isEmpty(dirtyFields) || !isValid}
                        type="submit"
                        size="large"
                      >
                        Unlock your session
                      </Button>

                      <Typography className="mt-32 text-md font-medium" color="text.secondary">
                        <span>I'm not</span>
                        <Link className="ml-4" to="/sign-in">
                          Brian Hughes
                        </Link>
                      </Typography>
                    </form>
                  </div>
                </div>
              </Paper>
            </div>

            <div className="flex min-w-0 flex-auto flex-col items-center sm:justify-center md:p-32">
              <Paper className="flex min-h-full w-full overflow-hidden rounded-0 sm:min-h-auto sm:w-auto sm:rounded-2xl sm:shadow md:w-full md:max-w-6xl">
                <Box
                  className="relative hidden h-full flex-auto items-center justify-center overflow-hidden p-64 md:flex lg:px-112"
                  sx={{ backgroundColor: "primary.main" }}
                >
                  <svg
                    className="pointer-events-none absolute inset-0"
                    viewBox="0 0 960 540"
                    width="100%"
                    height="100%"
                    preserveAspectRatio="xMidYMax slice"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <Box
                      component="g"
                      sx={{ color: "primary.light" }}
                      className="opacity-20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="100"
                    >
                      <circle r="234" cx="196" cy="23" />
                      <circle r="234" cx="790" cy="491" />
                    </Box>
                  </svg>
                  <Box
                    component="svg"
                    className="absolute -right-64 -top-64 opacity-20"
                    sx={{ color: "primary.light" }}
                    viewBox="0 0 220 192"
                    width="220px"
                    height="192px"
                    fill="none"
                  >
                    <defs>
                      <pattern
                        id="837c3e70-6c3a-44e6-8854-cc48c737b659"
                        x="0"
                        y="0"
                        width="20"
                        height="20"
                        patternUnits="userSpaceOnUse"
                      >
                        <rect x="0" y="0" width="4" height="4" fill="currentColor" />
                      </pattern>
                    </defs>
                    <rect
                      width="220"
                      height="192"
                      fill="url(#837c3e70-6c3a-44e6-8854-cc48c737b659)"
                    />
                  </Box>

                  <div className="relative z-10 w-full max-w-2xl">
                    <div className="text-7xl font-bold leading-none text-gray-100">
                      <div>Welcome to</div>
                      <div>our community</div>
                    </div>
                    <div className="mt-24 text-lg leading-6 tracking-tight text-gray-400">
                      Fuse helps developers to build organized and well coded dashboards full of
                      beautiful and rich modules. Join us and start building your application today.
                    </div>
                    <div className="mt-32 flex items-center">
                      <AvatarGroup
                        sx={{
                          "& .MuiAvatar-root": {
                            borderColor: "primary.main",
                          },
                        }}
                      >
                        <Avatar src="assets/images/avatars/female-18.jpg" />
                        <Avatar src="assets/images/avatars/female-11.jpg" />
                        <Avatar src="assets/images/avatars/male-09.jpg" />
                        <Avatar src="assets/images/avatars/male-16.jpg" />
                      </AvatarGroup>

                      <div className="ml-16 font-medium tracking-tight text-gray-400">
                        More than 17k people joined us, it's your turn
                      </div>
                    </div>
                    <div className="mt-32 flex items-center">
                      <AvatarGroup
                        sx={{
                          "& .MuiAvatar-root": {
                            borderColor: "primary.main",
                          },
                        }}
                      >
                        <Avatar src="assets/images/avatars/female-18.jpg" />
                        <Avatar src="assets/images/avatars/female-11.jpg" />
                        <Avatar src="assets/images/avatars/male-09.jpg" />
                        <Avatar src="assets/images/avatars/male-16.jpg" />
                      </AvatarGroup>

                      <div className="ml-16 font-medium tracking-tight text-gray-400">
                        More than 17k people joined us, it's your turn
                      </div>
                    </div>

                    <div className="mt-32 flex items-center">
                      <AvatarGroup
                        sx={{
                          "& .MuiAvatar-root": {
                            borderColor: "primary.main",
                          },
                        }}
                      >
                        <Avatar src="assets/images/avatars/female-18.jpg" />
                        <Avatar src="assets/images/avatars/female-11.jpg" />
                        <Avatar src="assets/images/avatars/male-09.jpg" />
                        <Avatar src="assets/images/avatars/male-16.jpg" />
                      </AvatarGroup>

                      <div className="ml-16 font-medium tracking-tight text-gray-400">
                        More than 17k people joined us, it's your turn
                      </div>
                    </div>

                    <div className="mt-32 flex items-center">
                      <AvatarGroup
                        sx={{
                          "& .MuiAvatar-root": {
                            borderColor: "primary.main",
                          },
                        }}
                      >
                        <Avatar src="assets/images/avatars/female-18.jpg" />
                        <Avatar src="assets/images/avatars/female-11.jpg" />
                        <Avatar src="assets/images/avatars/male-09.jpg" />
                        <Avatar src="assets/images/avatars/male-16.jpg" />
                      </AvatarGroup>

                      <div className="ml-16 font-medium tracking-tight text-gray-400">
                        More than 17k people joined us, it's your turn
                      </div>
                    </div>
                  </div>
                </Box>

                <div className="w-full px-16 py-32 ltr:border-l-1 rtl:border-r-1 sm:w-auto sm:p-48 md:p-64">
                  <div className="mx-auto w-full max-w-320 sm:mx-0 sm:w-320">
                    <img className="w-48" src="assets/images/afslogo/afslogo.png" alt="logo" />

                    <Typography className="mt-32 text-4xl font-extrabold leading-tight tracking-tight">
                      Unlock your session
                    </Typography>
                    <Typography className="font-medium">
                      Your session is locked due to inactivity
                    </Typography>

                    <form
                      name="registerForm"
                      noValidate
                      className="mt-32 flex w-full flex-col justify-center"
                      // onSubmit={handleSubmit(onSubmit)}
                    >
                      <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            className="mb-24"
                            label="Full name"
                            autoFocus
                            type="name"
                            error={!!errors.name}
                            helperText={errors?.name?.message}
                            variant="outlined"
                            fullWidth
                            disabled
                          />
                        )}
                      />

                      <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            className="mb-24"
                            label="Password"
                            type="password"
                            error={!!errors.password}
                            helperText={errors?.password?.message}
                            variant="outlined"
                            required
                            fullWidth
                          />
                        )}
                      />

                      <Button
                        variant="contained"
                        color="secondary"
                        className=" mt-4 w-full"
                        aria-label="Register"
                        disabled={_.isEmpty(dirtyFields) || !isValid}
                        type="submit"
                        size="large"
                      >
                        Unlock your session
                      </Button>

                      <Typography className="mt-32 text-md font-medium" color="text.secondary">
                        <span>I'm not</span>
                        <Link className="ml-4" to="/sign-in">
                          Brian Hughes
                        </Link>
                      </Typography>
                    </form>
                  </div>
                </div>
              </Paper>
            </div>
          </div>
        </>
      }
      scroll={isMobile ? "normal" : "page"}
    />
  );
}

export default Courses;
