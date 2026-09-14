## Purpose

Permite a cada usuario eliminar una colección propia sin borrar los bookmarks que estaban asociados a ella.

## ADDED Requirements

### Requirement: El usuario puede eliminar una colección propia
El sistema SHALL exponer una operación autenticada para eliminar una colección identificada por su UUID. La operación SHALL eliminar únicamente la colección cuyo identificador y propietario coincidan con el usuario autenticado.

#### Scenario: Eliminación exitosa de una colección propia
- **WHEN** un usuario autenticado solicita eliminar una colección que le pertenece
- **THEN** el sistema elimina la colección y responde con una confirmación de éxito

#### Scenario: Colección inexistente o ajena
- **WHEN** un usuario autenticado solicita eliminar una colección inexistente o propiedad de otro usuario
- **THEN** el sistema no modifica ninguna colección y responde con el error de colección no encontrada

### Requirement: Los bookmarks se liberan al eliminar la colección
Al eliminar una colección, el sistema SHALL conservar todos los bookmarks asociados y SHALL establecer su asociación de colección en nulo. El sistema MUST NOT eliminar los bookmarks, sus tags, sus websites ni su historial de accesos como consecuencia de eliminar una colección.

#### Scenario: Colección con bookmarks asociados
- **WHEN** un usuario elimina una colección que contiene bookmarks
- **THEN** los bookmarks permanecen disponibles para el usuario y quedan sin colección asignada

#### Scenario: Colección sin bookmarks asociados
- **WHEN** un usuario elimina una colección sin bookmarks asociados
- **THEN** el sistema elimina la colección correctamente sin modificar bookmarks
