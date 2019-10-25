const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Reflections Endpoints', function() {
  let db

  const {
    testUsers,
    testReflections,
  } = helpers.makeReflectionsFixtures()



  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  

  describe(`GET /api/reflections`, () => {
    context(`Given no reflections`, () => {
      beforeEach('insert user', () => helpers.seedUsers(db, testUsers))
      it(`responds with 200 and an empty list`, () => {
        console.log(testUsers[4])
        return supertest(app)
          .get('/api/reflections')
          .set('Authorization', helpers.makeAuthHeader(testUsers[4]))
          .expect(200, [])
      })
    })

    context(`Given an XSS attack reflection`, () => {
      const testUser = helpers.makeUsersArray()[1]
      const {
        maliciousReflection,
        expectedReflection,
      } = helpers.makeMaliciousReflection(testUser)

      beforeEach('insert malicious reflection', () => {
        return helpers.seedMaliciousReflection(
          db,
          testUser,
          maliciousReflection,
        )
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/reflections`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body[0].physical_content).to.eql(expectedReflection.physical_content)
            expect(res.body[0].mental_content).to.eql(expectedReflection.mental_content)
          })
      })
    })
  })

  describe(`GET /api/reflections/:id`, () => {
    context(`Given no reflections`, () => {
      beforeEach(() =>
        helpers.seedUsers(db, testUsers)
      )

      it(`responds with 404`, () => {
        const reflectionId = 123456
        return supertest(app)
          .get(`/api/reflections/${reflectionId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `reflection doesn't exist` })
      })
    })

    context('Given there are reflection in the database', () => {
      beforeEach('insert reflections', () =>
        helpers.seedReflectionsTables(
          db,
          testUsers,
          testReflections,
        )
      )

      it('responds with 200 and the specified reflection', () => {
        const reflectionId = 2
        const expectedReflection = helpers.makeExpectedReflection(
          testUsers,
          testReflections[reflectionId - 1],
        )

        return supertest(app)
          .get(`/api/reflections/${reflectionId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedReflection)
      })
    })
  })
})
