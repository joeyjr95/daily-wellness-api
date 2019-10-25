const path = require('path');
const express = require('express');
const xss = require('xss');
const logger = require('../logger');
const reflectionsService = require('./reflections-service');
const {requireAuth} = require('../middleware/jwt-auth');
const reflectionsRouter = express.Router();
const bodyParser = express.json();

const serializeReflection = reflection => ({ 
  id: reflection.id,
  user_id: reflection.user_id,
  physical_rating: reflection.physical_rating,
  physical_content: xss(reflection.physical_content),
  mental_rating: reflection.mental_rating,
  mental_content: xss(reflection.mental_content),
  date_created: reflection.date_added
});

reflectionsRouter
  .route('/')
  .all(requireAuth)
  .get((req,res,next)=> {
    const knexInstance = req.app.get('db');
    const userId = req.user.id;
    reflectionsService.getAllReflections(knexInstance, userId)
      .then(reflections => {
        console.log(reflections);
        res.json(reflections);
      })
      .catch(next);
  })
  .post(bodyParser,(req, res, next) => {
    console.log(req.body);
    const userId = req.user.id;
    const { user_id,
      physical_rating,
      physical_content,
      mental_rating,
      mental_content, 
    } = req.body;
    const newReflection = {
      user_id,
      physical_rating,
      physical_content,
      mental_rating,
      mental_content,
    };
    console.log(newReflection);
    for (const [key, value] of Object.entries(newReflection)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }
    reflectionsService.insertReflections(
      req.app.get('db'),
      userId,
      newReflection
    )
      .then(reflection => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl + `/${reflection.id}`))
          .json(reflection);
      })
      .catch(next);
  
    logger.info('REFLECTION was created');
  });
reflectionsRouter
  .route('/:id')
  .all(requireAuth)
  .all((req, res, next) => {
    const knexInstance = req.app.get('db');
    reflectionsService.getById(knexInstance, req.params.id)
   
      .then(reflection => {
        if(!reflection){
          return res.status(404).json({
            error: 'reflection doesn\'t exist'
          });
    
        }
        res.reflection = reflection;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeReflection(res.reflection));
  })
  .delete(( req, res, next ) => {
  
    reflectionsService.deleteReflection(
      req.app.get('db'),
      req.params.id
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(bodyParser,(req, res, next) => {
    const {
      id,
      user_id,
      physical_rating,
      physical_content,
      mental_rating,
      mental_content,} = req.body;
    const reflectionToUpdate = {
      id,
      user_id,
      physical_rating,
      physical_content,
      mental_rating,
      mental_content,};

    const numberOfValues = Object.values(reflectionToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: 'Request body must contain ALL REQUIRED FIELDS'
        }
      });
    reflectionsService.updateReflection(
      req.app.get('db'),
      req.params.id,
      reflectionToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = reflectionsRouter;