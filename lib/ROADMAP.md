1- Modify traversal system (ElementDef)
  * Eliminate get/set - everything should be an elementwrapper
  * Create type dictionary [done]
  * Add basic support for types (number, date) [done]
  * Add support for arry types
  * Add support for ElementWrapper types
    With it's own constructor()/appendToElement() methods for reading and writing

  * Remove all get/set garbage from element defs

    2- Refactor transactions and payment infos. Both SDDs and SCTs transactions and payments
have common fields that can be superclassed.

3- Refactor status responses.

4- Find a way to make ElementDefs inherit. (Maybe use annotations on class fields?- would break ordering)
