const averageService ={
  getAvg(knex, userId){
    return knex.from('reflections').select('users.user_name', 'users.id', 'users.full_name').avg({average_mental:'reflections.mental_rating'}).avg({average_physical:'reflections.physical_rating'}).join('users', {'reflections.user_id':'users.id'}).where('users.id', userId).groupBy('users.user_name', 'users.id', 'users.full_name');
    //.avg({average_mental:'reflections.mental_rating'})
  }
};
module.exports = averageService;