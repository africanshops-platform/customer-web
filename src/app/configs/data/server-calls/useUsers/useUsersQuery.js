import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import {
	removeUserSignUpToken,
	removeResendMerchantSignUpOtp,
	setMerchantSignUpStorage,
	setShopForgotPasswordPAYLOAD,
	remove_SHOP_FORGOTPASS_TOKEN
} from 'app/configs/utils/authUtils';
import { useNavigate } from 'react-router';
import { newShopSignup, storePreShopUserData } from '../../client/clientToApiRoutes';
import {
	clientForgotPasswordWithOtp,
	clientResetPasswordFromOtp,
	preSignUpWithOtp,
	preUserRegistrationWithOtp
} from '../../client/RepositoryClient';
import {
	clientLoggedInResetEmail,
	clientLoggedInResetPassword,
	clientUpdateUser,
	getApiAuthUser,
	getApiMinimizedAuthUser,
	clientComfirmActivateNewEmail,
	closeUserAccount,
	userLogOutCall
} from '../../client/RepositoryAuthClient';

/**
 * Handles NestJS and generic API errors and displays appropriate toast messages
 *
 * NestJS error formats:
 * 1. Validation errors: { message: ["error1", "error2"], error: "Bad Request", statusCode: 400 }
 * 2. Single errors: { message: "Error message", error: "Error Type", statusCode: 4xx/5xx }
 * 3. Custom errors: { message: string | string[], statusCode: number }
 *
 * @param {Error} error - The error object from the API call
 * @param {Object} options - Configuration options
 * @param {boolean} options.logError - Whether to log the error to console (default: true)
 * @param {string} options.fallbackMessage - Fallback message if no error message is found
 */
const handleApiError = (error, options = {}) => {
	const { logError = true, fallbackMessage = 'An unexpected error occurred. Please try again.' } = options;

	// Log error for debugging (always log to console for developers)
	if (logError) {
		console.error('API Error:', error);
		console.error('Error Response:', error?.response?.data);
	}

	// Extract error data from response
	const errorData = error?.response?.data;
	const errorMessage = errorData?.message;
	const statusCode = errorData?.statusCode || error?.response?.status;

	// Database connection error patterns to detect
	const isDatabaseError = (message) => {
		if (!message) return false;

		const dbErrorPatterns = [
			/database.*connection/i,
			/connect.*ECONNREFUSED/i,
			/connection.*refused/i,
			/ETIMEDOUT.*database/i,
			/database.*timeout/i,
			/cannot connect to.*database/i,
			/db.*connection.*failed/i,
			/sequelize.*connection/i,
			/typeorm.*connection/i,
			/prisma.*connection/i,
			/mongodb.*connection/i,
			/mysql.*connection/i,
			/postgres.*connection/i,
			/Connection terminated unexpectedly/i,
			/sorry, too many clients already/i
		];

		return dbErrorPatterns.some((pattern) => pattern.test(message));
	};

	// Check for database connection errors in error message or error object
	const fullErrorString = JSON.stringify(error);

	if (isDatabaseError(errorMessage) || isDatabaseError(fullErrorString) || isDatabaseError(error?.message)) {
		toast.error('Database connection lost. Please try again in a moment.');
		return;
	}

	// Handle different error message formats
	if (errorMessage) {
		// Case 1: Array of error messages (NestJS validation errors)
		if (Array.isArray(errorMessage)) {
			// Check if any message is a database error
			const hasDatabaseError = errorMessage.some((msg) => isDatabaseError(msg));

			if (hasDatabaseError) {
				toast.error('Database connection lost. Please try again in a moment.');
				return;
			}

			errorMessage.forEach((msg) => {
				toast.error(msg);
			});
			return;
		}

		// Case 2: Single error message string
		if (typeof errorMessage === 'string') {
			toast.error(errorMessage);
			return;
		}
	}

	// Case 3: Handle error object with nested message
	if (errorData?.error) {
		toast.error(`${errorData.error}: ${errorData.message || 'Unknown error'}`);
		return;
	}

	// Case 4: Network or other errors
	if (error?.message) {
		// Don't show technical error messages to users, use fallback instead
		if (error.message.includes('Network Error') || error.message.includes('timeout')) {
			toast.error('Network error. Please check your connection and try again.');
			return;
		}

		toast.error(error.message);
		return;
	}

	// Case 5: Fallback for unknown errors
	toast.error(fallbackMessage);
};

/** ***
 * sign up new shop entry without and with otp
 */

export function useShopForgotPassWithOtp() {
	// (Msvs => Done)
	const navigate = useNavigate();

	return useMutation(clientForgotPasswordWithOtp, {
		onSuccess: (data) => {
			console.log('useShopForgotPassWithOtp', data);

			if (data?.data?.token && data?.data?.success) {
				setShopForgotPasswordPAYLOAD(data?.data?.token);
				toast.success(data?.data?.message);
				navigate('/reset-password');
			} else if (data?.data?.infomessage) {
				toast.error(data?.data?.infomessage);
			} else {
				toast.info('something unexpected happened');
			}
		},
		onError: (error) => {
			handleApiError(error, {
				fallbackMessage: 'Failed to send password reset code. Please try again.'
			});
		}
	});
}

export function useResetShopPassFromOtp() {
	// (Msvs => Done)
	const navigate = useNavigate();
	return useMutation(clientResetPasswordFromOtp, {
		onSuccess: (data) => {
			if (data?.data?.message && data?.data?.success) {
				remove_SHOP_FORGOTPASS_TOKEN();
				toast.success(data?.data?.message);

				navigate('/sign-in');
			} else if (data?.data?.infomessage) {
				console.log('LoginError22', data?.data?.message);

				toast.error(data?.data?.infomessage);
			} else {
				toast.info('something unexpected happened');
			}
		},
		onError: (error) => {
			handleApiError(error, {
				fallbackMessage: 'Failed to reset password. Please try again or request a new reset code.'
			});
		}
	});
}

/** **Sign-Up User */
export function useShopSignUp() {
	return useMutation(newShopSignup, {
		onSuccess: (data) => {
			if (data) {
				toast.success(data?.data?.message);
			}
		},
		onError: (error) => {
			handleApiError(error, {
				fallbackMessage: 'Failed to sign up. Please check your information and try again.'
			});
		}
	});
}

export function useShopSignUpWithOtp() {
	// (Msvs => Done)
	// mutate({ formData, refParams }) — refParams is optional, see preSignUpWithOtp.
	return useMutation(({ formData, refParams }) => preSignUpWithOtp(formData, refParams), {
		onSuccess: (data) => {
			//   console.log("preShopSignUp", data?.data);

			if (data?.data?.registration_activation_token && data?.data?.success) {
				// Store tokrn in cookie
				setMerchantSignUpStorage(data?.data?.registration_activation_token);

				toast.success(
					data?.data?.message
						? data?.data?.message
						: 'Registration successful, please check your email for the activation link'
				);
			}

			if (data?.data?.errors) {
				Array.isArray(data?.data?.errors)
					? data?.data?.errors?.map((m) => toast.error(`${`${m?.message}` + `for` + ` ` + ` ${m?.path[1]}`}`))
					: toast.error(data?.data?.errors?.message);
			}
		},
		onError: (error) => {
			handleApiError(error, {
				fallbackMessage: 'Failed to complete registration. Please check your information and try again.'
			});
		}
	});
}

// Store New Shop User from token //(Msvs => Done)
export function useStoreShopPreSignUp() {
	return useMutation(storePreShopUserData, {
		onSuccess: (data) => {
			console.log('RegistrationResponse', data);
			console.log('ResponseMessage', data?.data?.message);

			if (data) {
				toast.success(data?.data?.message);
			}
		},
		onError: (error) => {
			handleApiError(error, {
				fallbackMessage: 'Failed to complete account setup. Please try again.'
			});
		}
	});
}

/** *Store New Shop User from OTP  useStoreShopPreSignUpFromOtp */ // (Msvs => Done)
export function useStoreUserPreSignUpFromOtp() {
	const navigate = useNavigate();

	return useMutation(preUserRegistrationWithOtp, {
		onSuccess: (data) => {
			console.log('RegistrationResponse', data?.data);
			console.log('ResponseMessage', data?.data?.message);

			if (data?.data?.success) {
				toast.success(data?.data?.message ? data?.data?.message : 'Registration completed successfully!');
				removeUserSignUpToken();
				removeResendMerchantSignUpOtp();
				navigate('/sign-in');
			}

			if (data?.data?.errors) {
				console.log('activate Merchant Errors', data?.data?.errors);

				Array.isArray(data?.data?.errors)
					? data?.data?.errors?.map((m) => toast.error(`${`${m?.message}` + `for` + ` ` + ` ${m?.path[1]}`}`))
					: toast.error(data?.data?.errors?.message);
			}
		},
		onError: (error) => {
			handleApiError(error, {
				fallbackMessage: 'Failed to activate account. The code may be invalid or expired.'
			});
		}
	});
}

/** **
 * #######################################################################
 * GET AUTHENTICATED USER/PROFILE ---SETTINGs DATA  starts
 * ############################################################################
 */

export function useGetAuthUserDetails() {
	return useQuery(['__authUserData'], getApiAuthUser);
}

export function useGetMinimizedAuthUserDetails() {
	return useQuery(['__minimizedAuthUserData'], getApiMinimizedAuthUser);
}

export function useUserUpdateMutation() {
	const queryClient = useQueryClient();

	return useMutation(clientUpdateUser, {
		onSuccess: (data) => {
			// console.log('Updated shop clientController', data);

			if (data?.data?.success) {
				toast.success(`${data?.data?.message ? data?.data?.message : 'User details updated successfully!!'}`);

				/** Set/update users client data to have newly updated user details */

				queryClient.invalidateQueries('__authUserData');
			}
		},
		onError: (error) => {
			toast.error(error.response && error.response.data.message ? error.response.data.message : error.message);
		}
	});
}
/** **
 * #######################################################################
 * GET AUTHENTICATED USER/PROFILE ---SETTINGs DATA  ends here
 * ############################################################################
 * ============================================================================================
 */

/** *
 * update user password by logged in merchant
 */
export function useUserSettingsResetPass() {
	return useMutation(clientLoggedInResetPassword, {
		onSuccess: (data) => {
			if (data?.data?.success) {
				toast.success(data?.data?.message ? data?.data?.message : 'Password updated successfully!!');
			}
		},

		onError: (error) => {
			handleApiError(error, {
				fallbackMessage: 'Failed to update password. Please check your current password and try again.'
			});
		}
	});
}

export function useInitiateUserSettingsChangeMail() {
	return useMutation(clientLoggedInResetEmail, {
		onSuccess: (data) => {
			if (data?.data?.success) {
				toast.success(data?.data?.message ? data?.data?.message : 'Email Change Initiated!!');
			}
		},

		onError: (error) => {
			handleApiError(error, {
				fallbackMessage: 'Failed to initiate email change.'
			});
		}
	});
}

/**
 * Confirm email change with OTP
 * Used to verify the new email address with the OTP sent to the user
 */
export function useConfirmUserSettingsChangeMail() {
	const queryClient = useQueryClient();

	return useMutation(clientComfirmActivateNewEmail, {
		onSuccess: (data) => {
			if (data?.data?.success) {
				toast.success(data?.data?.message ? data?.data?.message : 'Email changed successfully!');

				// Invalidate and refetch user data to get updated email
				queryClient.invalidateQueries('__authUserData');
				queryClient.invalidateQueries('__minimizedAuthUserData');
			}
		},

		onError: (error) => {
			handleApiError(error, {
				fallbackMessage: 'Failed to verify OTP. Please check the code and try again.'
			});
		}
	});
}

/** *Close User ACCOUNT */

/**
 * Close/Delete user account permanently
 * Used to permanently delete the user's account and all associated data
 * This action is irreversible
 */
export function useCloseUserAccount() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	return useMutation(closeUserAccount, {
		onSuccess: (data) => {
			if (data?.data?.success) {
				toast.success(data?.data?.message ? data?.data?.message : 'Account closed successfully!');

				// Clear all user data and redirect to home
				queryClient.clear();

				// Logout and redirect
				setTimeout(() => {
					userLogOutCall();
					// This will trigger the logout flow
					navigate('/sign-in');
					window.location.reload();
				}, 1500);
			}
		},

		onError: (error) => {
			handleApiError(error, {
				fallbackMessage: 'Failed to close account. Please try again or contact support.'
			});
		}
	});
}

/** **
 * #######################################################################
 *  AUTHENTICATED USER SETTINGS ==> (CHANGE PASSWORD ETC ) starts here
 * ############################################################################
 */
