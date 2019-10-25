const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      full_name: 'Test user 1',
      nickname: 'TU1',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      user_name: 'test-user-2',
      full_name: 'Test user 2',
      nickname: 'TU2',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      user_name: 'test-user-3',
      full_name: 'Test user 3',
      nickname: 'TU3',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 4,
      user_name: 'test-user-4',
      full_name: 'Test user 4',
      nickname: 'TU4',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 5,
      user_name: 'test-user-5',
      full_name: 'Test user 5',
      nickname: 'TU5',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ]
}

function makeReflectionsArray(users) {
  return [
     
    {
      id: 1,
      user_id: users[0].id,
      physical_rating: 3,
      physical_content: "im weak",
      mental_rating: 1,
      mental_content: "weaker than weak",
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
        id: 2,
        user_id: users[1].id,
        physical_rating: 3,
        physical_content: "im weak",
        mental_rating: 1,
        mental_content: "weaker than weak",
        date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
        id: 45,
        user_id: users[2].id,
        physical_rating: 3,
        physical_content: "im weak",
        mental_rating: 1,
        mental_content: "weaker than weak",
        date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
        id: 98,
        user_id: users[3].id,
        physical_rating: 3,
        physical_content: "im weak",
        mental_rating: 1,
        mental_content: "weaker than weak",
        date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ]
}

function makeExpectedReflection(users, reflection) {
  const testUsers = users
    .find(user => user.id === reflection.user_id)


  return {
    id: reflection.id,
    user_id: reflection.user_id,
    physical_rating: reflection.physical_rating,
    physical_content: reflection.physical_content,
    mental_rating: reflection.mental_rating,
    mental_content: reflection.mental_content,
    date_created: reflection.date_created.toISOString(),
  }
}


function makeMaliciousReflection(user) {
  const maliciousReflection = {
    id: 911,
    user_id: user.id,
    physical_rating: 3,
    physical_content:'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    mental_rating: 1,
    mental_content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    date_created: new Date(),
    
  }
  const expectedReflection = {
    ...makeExpectedReflection([user], maliciousReflection),
    physical_content: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    mental_content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  }
  return {
    maliciousReflection,
    expectedReflection,
  }
}

function makeReflectionsFixtures() {
  const testUsers = makeUsersArray()
  const testReflections = makeReflectionsArray(testUsers)
  
  return { testUsers, testReflections}
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        reflections,
        users
      `
    )
    .then(() =>
      Promise.all([
        trx.raw(`ALTER SEQUENCE reflections_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
        trx.raw(`SELECT setval('reflections_id_seq', 0)`),
        trx.raw(`SELECT setval('users_id_seq', 0)`),
      ])
    )
  )
}


function seedUsers(db, users) {
  
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('users').insert(preppedUsers)
    .then(() =>
      db.raw(
        `SELECT setval('users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

function seedReflectionsTables(db, users, reflections) {
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('reflections').insert(reflections)
    
    await trx.raw(
      `SELECT setval('reflections_id_seq', ?)`,
      [reflections[reflections.length - 1].id],
    )
  })
}

function seedMaliciousReflection(db, user, reflection) {
  return seedUsers(db, [user])
    .then(() =>
      db
        .into('reflections')
        .insert([reflection])
    )
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id,user_name: user.user_name, full_name: user.full_name }, secret, {
    subject: user.user_name,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

module.exports = {
  makeUsersArray,
  makeReflectionsArray,
  makeExpectedReflection,
  makeMaliciousReflection,
  

  makeReflectionsFixtures,
  cleanTables,
  seedReflectionsTables,
  seedMaliciousReflection,
  makeAuthHeader,
  seedUsers,
}
