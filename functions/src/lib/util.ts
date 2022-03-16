const util = {
    success: (status: boolean, message: string, data: any) => {
        return {
            status,
            success: true,
            message,
            data,
        };
    },
    fail: (status: boolean, message: string) => {
        return {
            status,
            success: false,
            message,
        };
    },
};

module.exports = util;