"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const querystring = require("querystring");
const util_1 = require("util");
const isEmpty = require("lodash/isEmpty");
const express_1 = require("express");
const account_1 = require("../support/account");
const body = express_1.urlencoded({ extended: false });
const keys = new Set();
const debug = (obj) => querystring.stringify(Object.entries(obj).reduce((acc, [key, value]) => {
    keys.add(key);
    if (isEmpty(value))
        return acc;
    acc[key] = util_1.inspect(value, { depth: null });
    return acc;
}, {}), '<br/>', ': ', {
    encodeURIComponent(value) { return keys.has(value) ? `<strong>${value}</strong>` : value; },
});
exports.routes = (app, provider) => {
    const { constructor: { errors: { SessionNotFound } } } = provider;
    app.use((req, res, next) => {
        const orig = res.render;
        // you'll probably want to use a full blown render engine capable of layouts
        res.render = (view, locals) => {
            app.render(view, locals, (err, html) => {
                if (err)
                    throw err;
                orig.call(res, '_layout', Object.assign(Object.assign({}, locals), { body: html }));
            });
        };
        next();
    });
    function setNoCache(req, res, next) {
        res.set('Pragma', 'no-cache');
        res.set('Cache-Control', 'no-cache, no-store');
        next();
    }
    app.get('/interaction/:uid', setNoCache, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { uid, prompt, params, session, } = yield provider.interactionDetails(req, res);
            const client = yield provider.Client.find(params.client_id);
            console.log(prompt.name);
            switch (prompt.name) {
                case 'select_account': {
                    if (!session) {
                        return provider.interactionFinished(req, res, { select_account: {} }, { mergeWithLastSubmission: false });
                    }
                    const account = yield provider.Account.findAccount(undefined, session.accountId);
                    const { email } = yield account.claims('prompt', 'email', { email: null }, []);
                    return res.render('select_account', {
                        client,
                        uid,
                        email,
                        details: prompt.details,
                        params,
                        title: 'Sign-in',
                        session: session ? debug(session) : undefined,
                        dbg: {
                            params: debug(params),
                            prompt: debug(prompt),
                        },
                    });
                }
                case 'login': {
                    return res.render('login', {
                        client,
                        uid,
                        details: prompt.details,
                        params,
                        title: 'Sign-in',
                        session: session ? debug(session) : undefined,
                        dbg: {
                            params: debug(params),
                            prompt: debug(prompt),
                        },
                    });
                }
                case 'consent': {
                    return res.render('interaction', {
                        client,
                        uid,
                        details: prompt.details,
                        params,
                        title: 'Authorize',
                        session: session ? debug(session) : undefined,
                        dbg: {
                            params: debug(params),
                            prompt: debug(prompt),
                        },
                    });
                }
                default:
                    return undefined;
            }
        }
        catch (err) {
            return next(err);
        }
    }));
    app.post('/interaction/:uid/login', setNoCache, body, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { prompt: { name, details } } = yield provider.interactionDetails(req, res);
            assert_1.strict.equal(name, 'login');
            const account = yield account_1.Account.findFromDB(req.body);
            if (!account) {
                const result = {
                    error: 'user_not_found',
                    error_description: 'Your username and/or password were incorrect',
                };
                return yield provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
            }
            const result = {
                select_account: {},
                login: {
                    account: account.accountId,
                },
            };
            yield provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
        }
        catch (err) {
            next(err);
        }
    }));
    app.post('/interaction/:uid/continue', setNoCache, body, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const interaction = yield provider.interactionDetails(req, res);
            const { prompt: { name, details } } = interaction;
            assert_1.strict.equal(name, 'select_account');
            console.log('continue details', details);
            if (req.body.switch) {
                if (interaction.params.prompt) {
                    const prompts = new Set(interaction.params.prompt.split(' '));
                    prompts.add('login');
                    interaction.params.prompt = [...prompts].join(' ');
                }
                else {
                    interaction.params.prompt = 'logout';
                }
                yield interaction.save();
            }
            const result = { select_account: {} };
            yield provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
        }
        catch (err) {
            next(err);
        }
    }));
    app.post('/interaction/:uid/confirm', setNoCache, body, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { prompt: { name, details } } = yield provider.interactionDetails(req, res);
            assert_1.strict.equal(name, 'consent');
            console.log('confirm details', details);
            const consent = {};
            // any scopes you do not wish to grant go in here
            //   otherwise details.scopes.new.concat(details.scopes.accepted) will be granted
            consent.rejectedScopes = [];
            // any claims you do not wish to grant go in here
            //   otherwise all claims mapped to granted scopes
            //   and details.claims.new.concat(details.claims.accepted) will be granted
            consent.rejectedClaims = [];
            // replace = false means previously rejected scopes and claims remain rejected
            // changing this to true will remove those rejections in favour of just what you rejected above
            consent.replace = false;
            const result = { consent };
            yield provider.interactionFinished(req, res, result, { mergeWithLastSubmission: true });
        }
        catch (err) {
            next(err);
        }
    }));
    app.get('/interaction/:uid/abort', setNoCache, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = {
                error: 'access_denied',
                error_description: 'End-User aborted interaction',
            };
            yield provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
        }
        catch (err) {
            next(err);
        }
    }));
    app.use((err, req, res, next) => {
        if (err instanceof SessionNotFound) {
            // handle interaction expired / session not found error
        }
        next(err);
    });
};
//# sourceMappingURL=express.js.map