import { strict as assert } from 'assert'
import * as querystring from 'querystring'
import { inspect }  from 'util';
import * as isEmpty from  'lodash/isEmpty'
import { urlencoded } from 'express'
import { Account } from '../support/account'

const body = urlencoded({ extended: false });

const keys = new Set();
const debug = (obj) => querystring.stringify(Object.entries(obj).reduce((acc, [key, value]) => {
  keys.add(key);
  if (isEmpty(value)) return acc;
  acc[key] = inspect(value, { depth: null });
  return acc;
}, {}), '<br/>', ': ', {
  encodeURIComponent(value) { return keys.has(value) ? `<strong>${value}</strong>` : value; },
});

export const routes = (app, provider) => {
  const { constructor: { errors: { SessionNotFound } } } = provider;

  app.use((req, res, next) => {
    const orig = res.render;
    // you'll probably want to use a full blown render engine capable of layouts
    res.render = (view, locals) => {
      app.render(view, locals, (err, html) => {
        if (err) throw err;
        orig.call(res, '_layout', {
          ...locals,
          body: html,
        });
      });
    };
    next();
  });

  function setNoCache(req, res, next) {
    res.set('Pragma', 'no-cache');
    res.set('Cache-Control', 'no-cache, no-store');
    next();
  }

  app.get('/interaction/:uid', setNoCache, async (req, res, next) => {
    try {
      const {
        uid, prompt, params, session,
      } = await provider.interactionDetails(req, res);

      const client = await provider.Client.find(params.client_id);
      console.log(prompt.name)
      switch (prompt.name) {
        case 'select_account': {
          if (!session) {
            return provider.interactionFinished(req, res, { select_account: {} }, { mergeWithLastSubmission: false });
          }

          const account = await provider.Account.findAccount(undefined, session.accountId);
          const { email } = await account.claims('prompt', 'email', { email: null }, []);

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
    } catch (err) {
      return next(err);
    }
  });

  app.post('/interaction/:uid/login', setNoCache, body, async (req, res, next) => {

    try {
      const { prompt: { name, details } } = await provider.interactionDetails(req, res);
      assert.equal(name, 'login');
      const account = await Account.findFromDB(req.body)

      if (!account) {
        const result = {
          error: 'user_not_found',
          error_description: 'Your username and/or password were incorrect',
        };
        return await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
      }

      const result = {
        select_account: {}, // make sure its skipped by the interaction policy since we just logged in
        login: {
          account: account.accountId,
        },
      };

      await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
    } catch (err) {
      next(err);
    }
  });

  app.post('/interaction/:uid/continue', setNoCache, body, async (req, res, next) => {
    try {
      const interaction = await provider.interactionDetails(req, res);
      const { prompt: { name, details } } = interaction;
      assert.equal(name, 'select_account');
      console.log('continue details', details)
      if (req.body.switch) {
        if (interaction.params.prompt) {
          const prompts = new Set(interaction.params.prompt.split(' '));
          prompts.add('login');
          interaction.params.prompt = [...prompts].join(' ');
        } else {
          interaction.params.prompt = 'logout';
        }
        await interaction.save();
      }

      const result = { select_account: {} };
      await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
    } catch (err) {
      next(err);
    }
  });

  app.post('/interaction/:uid/confirm', setNoCache, body, async (req, res, next) => {
    try {
      const { prompt: { name, details } } = await provider.interactionDetails(req, res);
      assert.equal(name, 'consent');
      console.log('confirm details', details)
      const consent: any = {};

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
      await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: true });
    } catch (err) {
      next(err);
    }
  });

  app.get('/interaction/:uid/abort', setNoCache, async (req, res, next) => {
    try {
      const result = {
        error: 'access_denied',
        error_description: 'End-User aborted interaction',
      };
      await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
    } catch (err) {
      next(err);
    }
  });

  app.use((err, req, res, next) => {
    if (err instanceof SessionNotFound) {
      // handle interaction expired / session not found error
    }
    next(err);
  });
};