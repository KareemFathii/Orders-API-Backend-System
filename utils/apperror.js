class errorhandler extends Error{
    constructor(){
        super();
    }
    createError(statusCode,statusText,message ) {
        this.statusCode = statusCode;
        this.status = statusText;
        this.message = message;
        return this;
    }
}
module.exports = new errorhandler();