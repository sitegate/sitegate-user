# sitegate-user

[![Dependency Status](https://david-dm.org/sitegate/sitegate-user.svg)](https://david-dm.org/sitegate/sitegate-user)
[![Build Status](https://travis-ci.org/sitegate/sitegate-user.svg)](https://travis-ci.org/sitegate/sitegate-user)

## Methods

###getById(id, callback)
**Usage**
```js
User.getById('550b42003376b4ec12fbbcb1', function (err, user) {
  console.log(user.name);
});
```
**Arguments**

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>id</td>
      <td><code>string</code></td>
      <td>The ID of the user.</td>
    </tr>
    <tr>
      <td>[options]</td>
      <td><code>object</code></td>
      <td>A hash with options.
        <br>Where
        <ul>
          <li><b><code>fields</code></b> - <code>{Array.&lt;string&gt;}</code> - List of fields to be returned.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>cb</td>
      <td><code>function(err, user)</code></td>
      <td>A callback function to receive the user.</td>
    </tr>
  </tbody>
</table>



###update(id, updatedFields, [callback])
**Usage**
```js
User.update('550b42003376b4ec12fbbcb1', {
  name: 'New name'
}, function (err, user) {
  console.log(user.name);
});
```
**Arguments**

| Name | Type | Description |
| --- | --- | --- |
| id | string | The ID of the user that has to be updated. |
| updatedFields | object | A hash of the fields that have to be updated with the new values. |
| cb | function(err, user) | A callback function to receive the updated user. |


License
========

The MIT License (MIT)
