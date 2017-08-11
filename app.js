const Sequelize = require('sequelize');

const conn = new Sequelize(process.env.DATABASE_URL);

const Foo = conn.define('foo', {
  name: Sequelize.STRING
});

Foo.belongsTo(Foo, { as: 'parentFoo' });
Foo.hasMany(Foo, { as: 'babyFoos', foreignKey: 'parentFooId' });


let foo1, foo2, foo3;
conn.sync()
  .then(()=> {
    return Promise.all([
      Foo.create({ name: 'foo1'}),
      Foo.create({ name: 'foo2'}),
      Foo.create({ name: 'foo3'})
    ])
    .then((result)=> {
      return [ foo1, foo2, foo3 ] = result;
    })
    .then(()=> {
      foo2.parentFooId = foo1.id;
      foo3.parentFooId = foo1.id;
      return Promise.all([
        foo2.save(),
        foo3.save()
      ]);
    })
    .then( ()=> {
      const options = {
        include: [
          { model: Foo, as: 'parentFoo' },
          { model: Foo, as: 'babyFoos' },
        ]
      };
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
