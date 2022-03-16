import express, {response} from "express";
import fs from "fs"
import XLSX from "xlsx";
import PDFDocument from 'pdfkit';
const router = express.Router();

console.log('items')

function recursiveTable(list,table) {

    for (var i = 0;i < list.length; i++){

        if (list[i].children !== undefined && list[i].children.length !==0) {
            table.push({"ID":list[i].PDI.toString().split('').join('.'),"name":list[i].name,"price":list[i].price,"amount":list[i].amount,"total":list[i].total})
            recursiveTable(list[i].children,table);
        } else {
            table.push({"ID":list[i].PDI.toString().split('').join('.'),"name":list[i].name,"price":list[i].price,"amount":list[i].amount,"total":list[i].total})
        }
    }

}
function totlizeParent(list, PDI){
    let sumOfChild = 0;
    let II = 1;
        for (var i = 0;i < list.length; i++){

            if (list[i].children !== undefined && list[i].children.length !==0) {
                list[i]["PDI"] = PDI+II;
                list[i].total_price = totlizeParent(list[i].children,(PDI+II)*10);
                list[i].price = list[i].total_price;
                list[i]["total"]=list[i].price*list[i].amount;
                PDI += II;
            }else {
                list[i]["PDI"] = PDI+II;
                list[i]["total"]=list[i].price*list[i].amount;
                II++;
            }
            sumOfChild +=list[i].price;
        }

    return sumOfChild;

}



router.get('/dpdf',(req,resp) => {

    let items = fs.readFileSync('./json/j2.json');
    let itemsList = JSON.parse(items);
    var table = [];
    totlizeParent(itemsList.children,0);
    recursiveTable(itemsList.children,table)

    var text = '';
    text += "ID\tname\t\tprice\tamount\ttotal\n";
    table.forEach(t => {
        Object.keys(t).forEach(k => {
            text += t[k]+'\t';
            if (k == "name" && t[k].length<8){
                text += '\t';
            }
        })
        text += '\n';
    });

    let p = new PDFDocument();
    p.pipe(fs.createWriteStream(`static/export.pdf`))
    p.fontSize(12).font("./servers/Pollock1CTT Regular.ttf").text(text, 100, 100);
    p.end();

    resp.download("./static/export.pdf");
});



router.get("/download", (req, resp) => {
    console.log(req.ip)

    let items = fs.readFileSync('./json/j2.json');
    let itemsList = JSON.parse(items);
    var table = [];
    totlizeParent(itemsList.children,0);
    recursiveTable(itemsList.children,table)
    let binaryWS = XLSX.utils.json_to_sheet(table);
    var wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, binaryWS, 'Binary values')
    XLSX.writeFile(wb, 'static/exported.xlsx');
    resp.download("./static/exported.xlsx");
});

router.get('/',(req,resp)=>{
    console.log(req.ip)

    let items = fs.readFileSync('./json/j2.json');
    let itemsList = JSON.parse(items);
    var table = [];
    totlizeParent(itemsList.children,0);
    recursiveTable(itemsList.children,table)

    resp.render('base',{table:table});
});

router.post('/delete',(req,resp)=>{
    console.log(req.ip,req.path)

    let items = fs.readFileSync('./json/j2.json');
    let itemsList = JSON.parse(items);
    var id = req.body.deleteRowID.split('.').map(Number);

    var temp = itemsList.children[parseInt(id[0])-1]
    for (var i = 1;i<id.length-1;i++){
        temp = temp.children[parseInt(id[i])-1]
    }
    temp.children.splice([id[id.length-1]-1],1)
    fs.writeFileSync('./json/j2.json',JSON.stringify(itemsList));

    resp.redirect("/items");



});
router.post('/add',(req,resp)=>{
    console.log(req.ip,req.path)
    var addRowName = req.body.addRowName;
    var addRowPrice = req.body.addRowPrice;
    var addRowAmount = req.body.addRowAmount;
    var id = req.body.addRowID.split('.').map(Number);

    let items = fs.readFileSync('./json/j2.json');
    let itemsList = JSON.parse(items);

    var temp = itemsList.children[parseInt(id[0])-1]
    for (var i = 1;i<id.length;i++){
        temp = temp.children[parseInt(id[i])-1]
    }

    temp.children.push({
            "name":addRowName,
            "price": parseInt(addRowPrice),
            "total_price": 0,
            "amount": parseInt(addRowAmount),
            "children": []

        })
    fs.writeFileSync('./json/j2.json',JSON.stringify(itemsList));

    resp.redirect("/items")

});


export default router;