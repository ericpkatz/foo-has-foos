const Sequelize = require('sequelize');

const conn = new Sequelize(process.env.DATABASE_URL);

const Foo = conn.define('foo', {
  name: Sequelize.STRING
});

//we need to specify an as here because it's on the same table
Foo.belongsTo(Foo, { as: 'parentFoo' });

//we need to specify which foreign key determines the relationship
Foo.hasMany(Foo, { as: 'babyFoos', foreignKey: 'parentFooId' });


let foo1, foo2, foo3;
conn.sync()
  .then(()=> {
    //create them
    return Promise.all([
      Foo.create({ name: 'foo1'}),
      Foo.create({ name: 'foo2'}),
      Foo.create({ name: 'foo3'})
    ])
    .then((result)=> {
      //store then in variables
      return [ foo1, foo2, foo3 ] = result;
    })
    .then(()=> {
      //set parents
      foo2.parentFooId = foo1.id;
      foo3.parentFooId = foo1.id;
      return Promise.all([
        foo2.save(),
        foo3.save()
      ]);
    })
    .then( ()=> {
      //options will be used for finding the parentFoo and babyFoos for each foo
      const options = {
        include: [
          { model: Foo, as: 'parentFoo' },
          { model: Foo, as: 'babyFoos' },
        ]
      };
      //get the data again with the associations
      return Promise.all([
        Foo.findById(foo1.id, options),
        Foo.findById(foo2.id, options),
        Foo.findById(foo3.id, options)
      ]);
    })
    .then(([ foo1, foo2, foo3 ])=> {
      console.log(`foo1 has ${foo1.babyFoos.length} baby foos`);
      console.log(`foo2 has a parent foo named ${foo2.parentFoo.name}`);
      console.log(`foo3 has a parent foo named ${foo2.parentFoo.name}`);
      
    });

  });
