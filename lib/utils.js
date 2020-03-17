module.exports = {
    promiseForMethod: callback => new Promise((res, rej) => {
        try {
            res(callback());
        }
        catch (err) {
            rej(err);
        }
    })
};
