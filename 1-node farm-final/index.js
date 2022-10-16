const fs = require('fs');
const http = require('http');
const url = require('url');
// const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');

const port = process.env.PORT || 8000 // for deploying to HEROKU must use process.env.PORT

/////////////////////////////////
// FILES

// Blocking, synchronous way
// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textIn);
// const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', textOut);
// console.log('File written!');

// Non-blocking, asynchronous way
// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//   if (err) return console.log('ERROR! 💥');

//   fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//     console.log(data2);
//     fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
//       console.log(data3);

//       fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
//         console.log('Your file has been written 😁');
//       })
//     });
//   });
// });
// console.log('Will read file!');

/////////////////////////////////
// SERVER

//temp คือ template ไม่ใช่ temporary
const tempOverview = fs.readFileSync(
	`${__dirname}/templates/template-overview.html`,
	'utf-8'
);
const tempCard = fs.readFileSync(
	`${__dirname}/templates/template-card.html`,
	'utf-8'
);
const tempProduct = fs.readFileSync(
	`${__dirname}/templates/template-product.html`,
	'utf-8'
);


// ยอมให้เป็น "SYNC" (blocking) เพราะเขารู้ว่า code บรรทัดนี้ มัน execute once ไม่ได้ block การทำงานของ server
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
console.log(typeof data, data.length)
const dataObj = JSON.parse(data);
console.log(typeof dataObj, dataObj.length)

// console.log(dataObj)

// const slugs = dataObj.map(el => slugify(el.productName, { lower: true }));
// console.log(slugs);





const server = http.createServer((req, res) => {
	const { query, pathname } = url.parse(req.url, true);
	//req.url คือ /product /overview หรือ /product?id=0
	// แต่ url.parse(req.url, true) จะได้เป็น object ที่มี ข้อมูล query: {id : "0"} กับ {pathname:"/product"} ในขณะที่ {path : "/product?id=0"}
	// พอทำคำสังนี้ ก็จะได้ query กับ pathname ทั้งสองค่ามาเก็บในตัวแปร

	// Overview page
	if (pathname === '/' || pathname === '/overview') {
		res.writeHead(200, {
			'Content-type': 'text/html'
		});

		/*
		//map คือ forEach ที่มีการ return เป็น new array ใน cardsHTML array
		// console.log(el) ได้เป็น dataObject[i] คือเป็น ข้อมูล JSON ทั้งหมดผลไม้ ตัวชนิดที่ i 
		const cardsHtml = dataObj.map((el) => {
			// console.log("ASDF")
			return replaceTemplate(tempCard, el)
		}).join("")
		// console.log(cardsHtml) //ได้เป็น string ของ html ของแต่ละ card ที่ถูก replace ด้วย ข้อมูลใน data.json แล้ว
		// console.log(typeof cardsHtml) //ถ้าไม่ใส่ .join("") ได้เป็น type object (array), พอใส่ .join("") ได้เป็น type string // เราต้องการได้เป็น join ให้เป็น string ของ HTML
		*/


		let returnString = ""
		for (let i = 0; i < dataObj.length; i++) {
			returnString += replaceTemplate(tempCard, dataObj[i])
		}


		// const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
		const output = tempOverview.replace('{%PRODUCT_CARDS%}', returnString);
		res.end(output);




		// Product page
	} else if (pathname === '/product') {
		res.writeHead(200, {
			'Content-type': 'text/html'
		});

		const output = replaceTemplate(tempProduct, dataObj[query.id]);
		res.end(output);







		// API
	} else if (pathname === '/api') {
		res.writeHead(200, {
			'Content-type': 'application/json'
		});
		res.end(data);

		// Not found
	} else {
		res.writeHead(404, {
			'Content-type': 'text/html',
			'my-own-header': 'hello-world'
		});
		res.end('<h1>Page not found!</h1>');
	}
});

// server.listen(8000, '127.0.0.1', () => {
// 	console.log('Listening to requests on port 8000');
// });


server.listen(port, () => {
	console.log('Listening to requests on port 8000');
});
