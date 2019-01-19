const request = require('supertest');
const app = require('../lib/app');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');

const createTweet = (handle) => {
  return request(app)
    .post('/tweets')
    .send({
      handle,
      text: 'oink tweet moo'
    })
    .then(res => res.body);
};

const createHashtag = (name) => {
  return request(app)
    .post('/tags')
    .send({
      name
    })
    .then(res => res.body);
};

describe('routes', () => {
  describe.skip('tweets', () => {
    beforeEach(done => {
      mkdirp('./data/tweets', err => {
        done(err);
      });
    }); 
  
    beforeEach(done => {
      rimraf('./data/tweets', err => {
        done(err);
      });
    });
  
    it('creates a new tweet', () => {
      return request(app)
        .post('/tweets')
        .send({ handle: 'paige', text: 'TWEET' })
        .then(res => {
          expect(res.body).toEqual({
            handle: 'paige',
            text: 'TWEET',
            _id: expect.any(String)
          });
        });
    });
  
    it('gets all the tweets', () => {
      const tweetsToCreate = ['yoyo', 'jelly123', 'jessie456'];
      return Promise.all(tweetsToCreate.map(createTweet))
        .then(() => {
          return request(app)
            .get('/tweets')
            .then(({ body }) => {
              expect(body).toHaveLength(3);
            });
        });
    });
  
    it('gets a tweet by id', () => {
      return createTweet('boohbah')
        .then(res => {
          return request(app)
            .get(`/tweets/${res._id}`)
            .then(({ body }) => {
              expect(body).toEqual({
                handle: 'boohbah',
                text: 'oink tweet moo',
                _id: expect.any(String)
              });
            });
        });
    });
  
    it('updates a tweet with :id and returns the update', () => {
      let newTweet = {
        handle: 'hollllaaaa',
        text: 'can you believe this *&#(*@???'
      };
      return createTweet('pizzatown')
        .then(createdTweet => {
          const _id = createdTweet._id;
          return request(app)
            .put(`/tweets/${_id}`)
            .send(newTweet);
        })
        .then(res => {
          expect(res.body.handle).toEqual('hollllaaaa');
        });
    });
  
    it('can delete a tweet', () => {
      return createTweet('rimrafin')
        .then(res => {
          return request(app)
            .delete(`/tweets/${res._id}`);
        })
        .then(({ body }) => {
          expect(body).toEqual({ deleted: 1 });
        });
    });
  
  });
  
  describe.only('tags', () => {
    beforeEach(done => {
      rimraf('./data/tags', err => {
        done(err);
      });
    });
  
    beforeEach(done => {
      mkdirp('./data/tags', err => {
        done(err);
      });
    });
    it('creates a new hashtag', () => {
      return request(app)
        .post('/tags')
        .send({ name: '#yolo' })
        .then(res => {
          expect(res.body).toEqual({
            name: '#yolo',
            _id: expect.any(String)
          });
        });
    });
    it('can get all the tags!', () => {
      const tagsToCreate = ['#banana', '#unclebob', '#hashtag', '#bloob3rryJ4m'];
      return Promise.all(tagsToCreate.map(createHashtag))
        .then(() => {
          return request(app)
            .get('/tags')
            .then(({ body }) => {
              expect(body).toHaveLength(4);
            });
        });
    });

    it('can get a tag by id', () => {
      return createHashtag('#yoloooooo')
        .then(res => {
          return request(app)
            .get(`/tags/${res._id}`)
            .then(res => {
              expect(res.body).toEqual({
                name: '#yoloooooo',
                _id: expect.any(String)
              });
            }); 
        });
    });

  });
});

