const express = require('express');
const json_stringify_safe = require('json-stringify-safe');
const puppeteer = require('puppeteer');

main();

function main()
{
    const app = express();
    app.use(express.static(__dirname))
    app.listen(8000, async function () {
        const browser = await puppeteer.launch();
        try {
            const page = await browser.newPage();
            puppeteer_log(page);
            await page.goto('http://localhost:8000/page2.html', {timeout: 10000, waitUntil: 'networkidle0'});
        }
        catch (error) {
            console.error(error);
        }
        finally {
            await browser.close();
            this.close();
        }
    });
}

function puppeteer_log(page)
{
    page.on('close', async function () {
        log('[puppeteer_close]');
    });
    page.on('console', async function (message) {
        const strings = await Promise.all(message.args().map(v => v.jsonValue().then(stringify, e => `ERR:${json_stringify_safe(e)}`)));
        log(`[puppeteer_console_${message.type()}] ${strings.join(' ')}`);
        function stringify(value) {
            return typeof value == 'object' ? json_stringify_safe(value) : value;
        }
    });
    page.on('dialog', function () {
        log('[puppeteer_dialog]');
    });
    page.on('domcontentloaded', function () {
        log('[puppeteer_domcontentloaded]');
    });
    page.on('error', function () {
        log('[puppeteer_error]');
    });
    page.on('frameattached', function () {
        log('[puppeteer_frameattached]');
    });
    page.on('framedetached', function () {
        log('[puppeteer_framedetached]');
    });
    page.on('framenavigated', function () {
        log('[puppeteer_framenavigated]');
    });
    page.on('load', function () {
        log('[puppeteer_load]');
    });
    page.on('metrics', function () {
        log('[puppeteer_metrics]');
    });
    page.on('pageerror', function (error) {
        log(`[puppeteer_pageerror] ${json_stringify_safe(error.message)}`);
    });
    page.on('request', async function (request) {
        log(`[puppeteer_request] ${request.method()} ${request.url()}`);
    });
    page.on('requestfailed', async function (request) {
        log(`[puppeteer_requestfailed] ${request.method()} ${request.url()} ${request.failure().errorText}`);
    });
    page.on('requestfinished', async function () {
        log('[puppeteer_requestfinished]');
    });
    page.on('response', async function (response) {
        const request = response.request();
        log(`[puppeteer_response] ${response.status()} ${request.method()} ${request.url()}`);
    });
}

function log(message)
{
    console.log(`[${(new Date()).toJSON()}]${message}`);
}
