const reflectionsService = {
  getAllReflections(knex, userId) {
    return knex.from('reflections').select('reflections.id','reflections.user_id',  'reflections.physical_rating', 'reflections.physical_content','reflections.mental_rating', 'reflections.mental_content', 'reflections.date_created').join('users', {'reflections.user_id':'users.id'}).where('users.id',userId ).groupBy('reflections.id', 'reflections.user_id', 'reflections.physical_rating', 'reflections.physical_content','reflections.mental_rating', 'reflections.mental_content', 'reflections.date_created');
  },
  insertReflections(knex,userId, newReflection) {
    return knex
      .insert(newReflection)
      .into('reflections')
      .returning('*')
      .where('reflections.user_id',userId )
      .then(rows => {
        return rows[0];
      });
  },
  getById(knex, id) {
    return knex.from('reflections').select('*').where('id', id).first();
  },
  deleteReflection(knex, id) {
    return knex('reflections')
      .where({ id })
      .delete();
  },
  updateReflection(knex, id, newReflectionFields) {
    return knex('reflections')
      .update(newReflectionFields)
      .where({ id });
          
  }
        
        
};
        
module.exports = reflectionsService;