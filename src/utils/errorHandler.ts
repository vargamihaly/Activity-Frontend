import axios, { AxiosError } from 'axios';

interface HandleErrorOptions {
    showAlert?: boolean;
    retryFunction?: () => Promise<any>;
    retryCount?: number;
}

export const handleApiError = async (
    error: unknown,
    options: HandleErrorOptions = { showAlert: true, retryCount: 0 }
): Promise<void> => {
    // Log the error (can be expanded to send to external logging services)
    console.error('API Error:', error);

    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>; // Type assertion here
        const errorMessage = axiosError.response?.data?.message || axiosError.message || 'An unknown error occurred';

        // Show alert if configured to do so
        if (options.showAlert) {
            alert(`Error: ${errorMessage}`);
        }

        // Handle retries if a retry function is provided
        if (options.retryFunction && options.retryCount && options.retryCount > 0) {
            try {
                console.log(`Retrying... Attempts left: ${options.retryCount}`);
                await options.retryFunction();
            } catch (retryError) {
                return handleApiError(retryError, {
                    ...options,
                    retryCount: options.retryCount - 1,
                });
            }
        }
    } else if (error instanceof Error) {
        // Handle non-Axios errors
        console.error('Error:', error.message);
        if (options.showAlert) {
            alert(`Error: ${error.message}`);
        }
    } else {
        // Unknown error type
        if (options.showAlert) {
            alert('An unknown error occurred.');
        }
    }
};
