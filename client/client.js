/*
        @title: ton-link-node-v3
        @custom: version 3.0
        @author: Konstantin Klyuchnikov (@knstntn_asuoki)
*/

const TonWeb = require("tonweb");
const tonMnemonic = require("tonweb-mnemonic");
var moment = require('moment');
var clc = require("cli-color");
var pg = require('pg');
const { unwatchFile } = require("fs");
var client;
var network;
require('dotenv').config()

const OFFCHAIN_CONTENT_PREFIX = 0x01;
const Cell = TonWeb.boc.Cell;
const Address = TonWeb.utils.Address;
tonMnemonic.wordlists.EN;

async function getTime() {
        var now = moment().format("YYYY-MM-DD HH:mm:ss");
        return now
}

const parseUri = (bytes) => {
        return new TextDecoder().decode(bytes);
}

const serializeUri = (uri) => {
        return new TextEncoder().encode(encodeURI(uri));
}

const readIntFromBitString = (bs, cursor, bits) => {
        let n = BigInt(0);
        for (let i = 0; i < bits; i++) {
                n *= BigInt(2);
                n += BigInt(bs.get(cursor + i));
        }
        return n;
}

const parseAddress = cell => {
        let n = readIntFromBitString(cell.bits, 3, 8);
        if (n > BigInt(127)) {
                n = n - BigInt(256);
        }
        const hashPart = readIntFromBitString(cell.bits, 3 + 8, 256);
        if (n.toString(10) + ":" + hashPart.toString(16) === '0:0') return null;
        const s = n.toString(10) + ":" + hashPart.toString(16).padStart(64, '0');
        return new Address(s);
};

function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
}

async function getLastJobId(tonweb) {
        try {
                const result = await tonweb.provider.call2((process.env).ORACLEADDRESS, 'get_last_job');
                return result.toNumber();
        } catch (error) {
                return undefined;
        }
}

async function getJobById(tonweb, jobID) {
        const result = await tonweb.provider.call2((process.env).ORACLEADDRESS, 'get_job_by_jobid', [['num', jobID]]);
        console.log(clc.blue('ton-link-node-' + network), clc.green('[INFO]'), `[${await getTime()}]`, 'Get job by jobID', `JobID=${jobID}`);
        return result;
}

async function parseJobCell(cell, myAddress) {
        const slice = cell.beginParse();
        var jobID = slice.loadUint(64).toNumber()
        var start = slice.loadUint(64).toNumber()
        var end = slice.loadUint(64).toNumber()
        var status = slice.loadUint(1).toNumber()
        const content = slice.loadRef();
        var content_slice = content;
        var link = {}
        try {
                var link_slice = (content_slice.loadRef());
                var how_much = link_slice.loadUint(32).toNumber()
                link.count = how_much
                var url_array = []
                for (let index = 0; index < how_much; index++) {
                        var link_cell = link_slice.loadRef()
                        url_array[index] = parseUri((link_cell.array).slice(1));

                }
                link.url_array = url_array
        } catch (error) {
                console.log(clc.blue('ton-link-node-' + network), clc.red('[ERROR]'), `[${await getTime()}]`, clc.red(error));
        }

        var address_slice = (slice.loadRef());
        var first_address_slice = (address_slice.loadRef())
        var second_address_slice = (address_slice.loadRef())
        var key = 0;
        var count = 0
        for (let index = 0; index < 3; index++) {
                var temp_address = first_address_slice.loadAddress();
                count++
                if (temp_address.toString(true, true, true) == myAddress) { break; key = 1; }
        }
        if (key == 0) {
                count = 0;
                for (let index = 0; index < 2; index++) {
                        var temp_address = second_address_slice.loadAddress();
                        count++
                        if (temp_address.toString(true, true, true) == myAddress) { break; key = 1; }
                }
        }
        return {
                jobID,
                start,
                end,
                status,
                link,
                count
        }
}

async function checkForOwnership(cell, myAddress) {
        const slice = cell.beginParse();
        var jobID = slice.loadUint(64).toNumber()
        var start = slice.loadUint(64).toNumber()
        var end = slice.loadUint(64).toNumber()
        var status = slice.loadUint(1).toNumber()
        const content = slice.loadRef();
        var content_slice = content
        var address_slice = (slice.loadRef());
        var first_address_slice = (address_slice.loadRef())
        var second_address_slice = (address_slice.loadRef())
        var key = 0;
        var count = 0;
        var res = 0;
        for (let index = 0; index < 3; index++) {
                var temp_address = first_address_slice.loadAddress();
                count++
                if (temp_address.toString(true, true, true) == myAddress) { key = 1; res = count; break; }
        }
        if (key == 0) {
                for (let index = 0; index < 2; index++) {
                        var temp_address = second_address_slice.loadAddress();
                        count++
                        if (temp_address.toString(true, true, true) == myAddress) { res = count; key = 1; break; }
                }
        }
        if (res != 0) {
                console.log(clc.blue('ton-link-node-' + network), clc.green('[INFO]'), `[${await getTime()}]`, `runtime=${(performance.now() - start).toFixed(6)}`, `JobID=${jobID}`, 'Check ownership =', clc.green(true), 'Place =', clc.green(res));
                return true
        } else {
                console.log(clc.blue('ton-link-node-' + network), clc.green('[INFO]'), `[${await getTime()}]`, `runtime=${(performance.now() - start).toFixed(6)}`, `JobID=${jobID}`, 'Check ownership =', clc.red(false));
                return false
        }
}

async function getInfoAboutProvider(tonweb, addsess) {
        const cell = new Cell()
        cell.bits.writeAddress(new TonWeb.utils.Address(addsess));
        var result;
        try {
                result = await tonweb.provider.call2((process.env).ORACLEADDRESS, 'get_info_about_provider', [['tvm.Slice', TonWeb.utils.bytesToBase64(await cell.toBoc(false))]]);
        } catch (error) {
                console.log(clc.blue('ton-link-node-' + network), clc.red('[ERROR]'), `[${await getTime()}]`, 'Info about provider =', clc.red(error));
                return false;
        }
        try {
                var s = result.beginParse()
        } catch (error) {
                console.log(clc.blue('ton-link-node-' + network), clc.red('[ERROR]'), `[${await getTime()}]`, 'Info about provider =', clc.red("Provider not found"));
                return false;
        }
        var a = s.loadAddress();
        var status = s.loadUint(2).toNumber()
        var time = s.loadUint(64).toNumber()
        var balance = s.loadCoins().toNumber()
        console.log(clc.blue('ton-link-node-' + network), clc.yellow('[CONFIGURATION]'), `[${await getTime()}]`, 'Info about provider =', clc.green(`Address = ${a.toString(true, true, true)}`, `Status = ${status}`, `Balance = ${balance / 10 ** 9}`));
}

async function createAddBody(jobID, result) {
        const cell = new Cell();
        cell.bits.writeUint(160, 32)
        cell.bits.writeUint(0, 64)
        cell.bits.writeUint(jobID, 64)
        cell.bits.writeUint(result, 64)
        return cell
}

async function send(wallet, body, keyPair) {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: (process.env).ORACLEADDRESS,
                amount: TonWeb.utils.toNano("0.15"),
                seqno: seqno,
                payload: body,
                sendMode: 3
        }).send()

}

async function getResult(tonweb, params) {
        var jobID = params.jobID
        var start = params.start
        var end = params.end
        var status = params.status
        var link = params.link
        var link_count = link.count
        var url_array = link.url_array
        try {
                var res;
                var result_from_url = await fetch(url_array[0].toString())
                result_from_url = await result_from_url.json();
                res = result_from_url;
                for (let index = 1; index < url_array.length; index++) {
                        res = res[url_array[index]]
                }
                return (parseFloat(res) * (10 ** 9))
        } catch (error) {
                console.log(error)
                return false;
        }
}

async function addIntoDatabase(tonweb, params) {
        try {
                var jobID = params.jobID
                var start = params.start
                var end = params.end
                var status = params.status
                var link = params.link
                var count = params.count
                client.query(`INSERT INTO job(jobid, ownership_job, status_job, place, start_time, end_time) VALUES(${jobID}, 1, ${count}, ${status}, ${start}, ${end})`);
                var link_count = link.count
                var url_array = link.url_array

                var req;
                switch (url_array.length) {
                        case 4:
                                req = `INSERT INTO link(jobid, count, first_link, second, third, fourth) values(${jobID}, ${link_count}, ${url_array[0]}, ${url_array[1]}, ${url_array[2]}, ${url_array[3]})`
                                break;
                        case 3:
                                req = `INSERT INTO link(jobid, count, first_link, second, third, fourth) values(${jobID}, ${link_count}, '${url_array[0]}', '${url_array[1]}', '${url_array[2]}', 'null')`
                                break;
                        case 2:
                                req = req = `INSERT INTO link(jobid, count, first_link, second, third, fourth) values(${jobID}, ${link_count}, '${url_array[0]}', '${url_array[1]}', 'null', 'null')`
                                break;
                        case 1:
                                req = `INSERT INTO link(jobid, count, first_link, second, third, fourth) values(${jobID}, ${link_count}, '${url_array[0]}', 'null', 'null', 'null')`
                                break;
                }
                client.query(req)
                console.log(clc.blue('ton-link-node-' + network), clc.green('INFO'), ` [${await getTime()}]`, `INSERT INTO job(jobid, ownership_job, status_job, place, start_time, end_time) values(${jobID}, 1, ${status}, ${start}, ${end})`);
                console.log(clc.blue('ton-link-node-' + network), clc.green('INFO'), ` [${await getTime()}]`, req);
        } catch (error) {
                console.log(clc.blue('ton-link-node-' + network), clc.red('[ERROR]'), `[${await getTime()}]`, clc.red(error));
        }
}

async function checkingForExpiration(time, jobID) {
        if (time < Math.floor(Date.now() / 1000)) {
                console.log(clc.blue('ton-link-node-' + network), clc.red('[ERROR]'), `[${await getTime()}]`, `JobID=${jobID}`, clc.red('Expired'));
                return true;
        } else {
                return false;
        }
}

async function checkForReplace(jobID) {
        try {
                var query = await client.query(`SELECT EXISTS(SELECT jobID FROM job WHERE jobId = ${jobID});`);
                var row = query.rows[0];
                console.log(clc.blue('ton-link-node-' + network), clc.green('INFO'), ` [${await getTime()}]`, `SELECT EXISTS(SELECT jobID FROM job WHERE jobId = ${jobID});`);
                return row.exists
        } catch (error) {
                console.log(clc.blue('ton-link-node-' + network), clc.red('[ERROR]'), `[${await getTime()}]`, clc.red(error));
                return true;
        }
}


async function main() {
        var seed = ((process.env).SEED)
        let arr = seed.split(' ');
        var net = (process.env).NETWORK
        network = net;
        var tonweb = new TonWeb(new TonWeb.HttpProvider((process.env).TON_API_URL, { apiKey: (process.env).TONCENTERKEY }));
        const keyPair = await tonMnemonic.mnemonicToKeyPair(arr);
        const WalletClass = tonweb.wallet.all[(process.env).WALLET_V];
        const wallet = new WalletClass(tonweb.provider, {
                publicKey: keyPair.publicKey,
                wc: 0
        });
        client = new pg.Client((process.env).DATABASE_URL);
        client.connect()
        const walletAddress = await wallet.getAddress();
        console.clear()
        console.log(clc.blue('ton-link-node-' + net), clc.yellow('[CONFIGURATION]'), `[${await getTime()}]`, 'Starting ton-link node...');
        console.log(clc.blue('ton-link-node-' + net), clc.yellow('[CONFIGURATION]'), `[${await getTime()}]`, 'Connect to TONCENTER =', clc.green((await tonweb.provider.getWalletInfo(walletAddress.toString(true, true, true))).account_state));
        console.log(clc.blue('ton-link-node-' + net), clc.yellow('[CONFIGURATION]'), `[${await getTime()}]`, 'Usint wallet =', clc.green(walletAddress.toString(true, true, true)));
        console.log(clc.blue('ton-link-node-' + net), clc.yellow('[CONFIGURATION]'), `[${await getTime()}]`, 'Using ton-link oracle =', clc.green((process.env).ORACLEADDRESS));
        await sleep(1000)
        console.log(clc.blue('ton-link-node-' + net), clc.yellow('[CONFIGURATION]'), `[${await getTime()}]`, 'Check ton-link oracle =', clc.green((await tonweb.provider.getWalletInfo((process.env).ORACLEADDRESS)).account_state));
        if (await getInfoAboutProvider(tonweb, walletAddress.toString(true, true, true)) == false) { process.emit('SIGINT'); }
        console.log(clc.blue('ton-link-node-' + net), clc.yellow('[CONFIGURATION]'), `[${await getTime()}]`, clc.green('Configuration complete'));
        while (1) {
                await sleep(1000)
                var jobID = await getLastJobId(tonweb);
                if (jobID == undefined || jobID == 0) { continue; }
                const job_cell = await getJobById(tonweb, jobID)
                var res = await checkForOwnership(job_cell, walletAddress.toString(true, true, true));
                if (res == true) {
                        if (await checkForReplace(jobID)) { continue; }
                        const params = await parseJobCell(job_cell, walletAddress.toString(true, true, true))
                        if (await checkingForExpiration(params.end, jobID)) { continue; }
                        if (params.status == 0) {
                                var result = await getResult(tonweb, params);
                                if (result == false) { console.log(clc.blue('ton-link-node-' + net), clc.red('[ERROR]'), `[${await getTime()}]`, `JobID=${jobID}`, 'Error in getting result'); continue; }
                                console.log(clc.blue('ton-link-node-' + net), clc.green('[INFO]'), `[${await getTime()}]`, `JobID=${jobID}`, 'Getting result');
                                var body = await createAddBody(jobID, result);
                                await send(wallet, body, keyPair);
                                await addIntoDatabase(tonweb, params);
                                await sleep(2300)
                                console.log(clc.blue('ton-link-node-' + net), clc.green('[INFO]'), ` [${await getTime()}]`, `JobID=${jobID}`, clc.green('SEND UPDATE'));
                        }
                }
        }
}

if (process.platform === 'win32') {
        require('readline')
                .createInterface({
                        input: process.stdin,
                        output: process.stdout
                })
                .on('SIGINT', function () {
                        process.emit('SIGINT');
                });
}


process.on('SIGINT', async function () {
        console.log(clc.red('INFO'), `[${await getTime()}]`, 'Stopped ton-link node...');
        process.exit();
});

main()