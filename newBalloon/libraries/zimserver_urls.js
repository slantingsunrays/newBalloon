// the zim server was changed to zimjs.com to access secure connections
// the server was on Amazon EC2 machine until January 2020
// the server was then moved internal to ZIM until August 2020
// now it is hosted on a more modern server with ZIM DNS as follows:
// this file abstracts the specifics and lets us change the domain in one place
// it should be used externally with ZIM Socket and ZIM Wonder and internally with ZIM Distill

var zimSocketURL  = "https://socket.zimjs.org";
var zimWonderURL  = "https://wonder.zimjs.org";
var zimDistillURL = "https://distill.zimjs.org";
