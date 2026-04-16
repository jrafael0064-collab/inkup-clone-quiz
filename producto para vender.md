### producto para vender



Ahora sí… aquí está el verdadero negocio 😏

👉 esto ya no es código → es producto vendible



Te lo explico directo y sin humo.



🧠 QUÉ ESTÁS VENDIENDO REALMENTE



NO vendes:



❌ un quiz

❌ una web

❌ IA



👉 vendes esto:



🔥 “Sistema para conseguir clientes por Instagram sin perder tiempo”

🎯 TRADUCCIÓN PARA TATUADOR



Tú no dices:



“te hago un quiz con IA”



Dices:



Te monto un sistema que filtra clientes,

les orienta antes de hablar contigo

y te llegan por WhatsApp mucho más claros.



💥 eso sí lo entienden



💡 PROBLEMA REAL DEL TATUADOR



Todos tienen esto:



pierden tiempo con gente que no sabe lo que quiere

mil conversaciones que no acaban en nada

clientes mal enfocados

preguntas repetidas

🔥 TU SOLUCIÓN

En vez de hablar con 20 personas sin rumbo,

hablas con 5 que ya vienen orientadas.



💥 eso es oro



📦 CÓMO LO EMPAQUETAS

Nombre simple



👉 “Sistema de captación por WhatsApp”



o más directo:



👉 “Filtro de clientes para tatuadores”



💰 CÓMO COBRAR (realista)

OPCIÓN 1 (rápida)



👉 Setup:



150€ – 300€



Incluye:



quiz personalizado

integración

textos

IA adaptada

OPCIÓN 2 (mejor)



👉 Setup + mensual



150€ setup

20€–50€/mes



👉 mantenimiento + mejoras



OPCIÓN 3 (pro)



👉 solo mensual



30€–70€/mes



pero con:



soporte

mejoras IA

ajustes

🧠 QUÉ LE ENSEÑAS (IMPORTANTE)



No le enseñas código.



👉 le enseñas esto:



Flujo:

Instagram

cliente entra al test

responde

le escribe por WhatsApp

tú ya sabes qué quiere



💥 y le dices:



👉 “esto ya lo estás perdiendo ahora”



🎯 DEMO (CLAVE)



Le enseñas TU sistema:



👉 tu web

👉 tu admin

👉 leads



💥 eso vende solo



🧲 MENSAJE PARA CONTACTAR TATUADORES



Te dejo uno listo:



Ey tío 👋



Estoy montando un sistema para tatuadores

que filtra clientes antes de que te escriban

y hace que te lleguen mucho más claros por WhatsApp.



Lo estoy probando ahora mismo

y está funcionando bastante bien.



Si quieres te lo enseño en 5 minutos

y ves si te encaja 👀

⚠️ IMPORTANTE



NO vendas así:



❌ “te hago una web”

❌ “te hago un quiz”



💥 VENDE ASÍ



👉 “te ahorro tiempo y te llegan mejores clientes”



🚀 ESTRATEGIA REAL



Empieza con:



👉 2–3 tatuadores cercanos

👉 incluso gratis o barato



Objetivo:



👉 casos reales

👉 feedback

👉 mejorar sistema



🧠 CUANDO ESCALA



Luego:



👉 Instagram Ads

👉 vender a más tatuadores

👉 automatizar



🎯 LO MÁS IMPORTANTE



No esperes a que esté perfecto.



👉 ya está suficientemente bueno para vender



👉 Siguiente paso (muy clave)



Si quieres, te hago:



👉 cómo cerrar la venta en llamada o chat

(palabras exactas)



Porque ahí es donde se gana dinero de verdad 😏



### Pasos a seguir para cada tatuador individual

\--------------------------------------------------------------------------------------------

##### 

##### Estructura que te recomiendo



Fase 1: tú gestionas todo

De momento no montes login por tatuador.

Haz esto:





tú creas un quiz por tatuador





le asignas su teléfono





le das su enlace





tú gestionas el panel





Esto te permite empezar ya, vender ya y no meterte todavía en auth y permisos.



##### Qué representa cada tatuador

Cada tatuador = un quiz único

O sea:





tatuador A → quiz A → quiz\_id A





tatuador B → quiz B → quiz\_id B





Y todo cuelga de ese quiz\_id.



##### Base de datos mínima

Tabla quizzes

Asegúrate de tener al menos estas columnas:





id





title





phone





created\_at





Opcional pero recomendable:





tattoo\_artist\_name





instagram





is\_active





###### Recomendación

Añade estas dos columnas:

alter table quizzes add column tattoo\_artist\_name text;alter table quizzes add column instagram text;

No son obligatorias, pero te ayudan muchísimo a organizarte.



Cómo crear un nuevo tatuador

##### Paso 1: crear un quiz nuevo

En tu admin o directamente en Supabase, creas una fila en quizzes.

Ejemplo:





title: Quiz Lorena Baeza





phone: 34633131318





tattoo\_artist\_name: Lorena Baeza





instagram: @lorenabaeza





Eso te genera un id.

Ese id es la clave de todo.



##### Paso 2: crear sus preguntas

Vas al admin de ese quiz y le montas sus preguntas.

Por ejemplo:





¿Qué tipo de tatuaje te llama más?





¿Qué estilo visual te atrae más?





etc.





Cada tatuador puede tener:





el mismo quiz base





o una versión personalizada





Mi consejo

Empieza con un quiz base común para todos.

Luego personalizas solo si hace falta.



##### Paso 3: asignar su teléfono

En la fila de quizzes, en phone, pones el WhatsApp Business del tatuador.

Ese número será donde aterriza el mensaje final del cliente.



##### Paso 4: generar su enlace

Su enlace será:

https://inkup-clone-quiz.vercel.app/quiz/QUIZ\_ID

Ejemplo:

https://inkup-clone-quiz.vercel.app/quiz/40799d7f-ff43-4406-95a5-24652e96f316

Ese es el enlace que le das para:





bio de Instagram





stories





campañas





Linktree







##### Qué le entregas al tatuador

A cada tatuador le das esto:

Pack de entrega





Enlace del quiz





Texto para bio





Texto para stories





Texto para reels





y si quieres, captura del admin para que vea cómo funciona





Ejemplo de entrega

Tu sistema ya está listo.Tu enlace:https://inkup-clone-quiz.vercel.app/quiz/XXXXXPonlo en tu bio de Instagram y úsalo también en stories y campañas.Cuando alguien complete el test, te llegará directamente al WhatsApp que hemos configurado.



##### Cómo organizas los leads por tatuador

Ya lo tienes medio hecho.

Cada lead en answers tiene:





quiz\_id





name





phone





data





status





Eso significa que ya puedes saber a qué tatuador pertenece cada lead, porque el lead pertenece al quiz\_id.

En la práctica

Cuando filtres por quiz en /admin/leads, estás viendo los leads de un tatuador concreto.

💥 O sea, esto ya te sirve como separación por tatuador.



##### Flujo operativo para montar a cada tatuador

Sistema repetible

Haz esto siempre igual:

1\.

Crear quiz

2\.

Poner:





título





teléfono





nombre del tatuador





3\.

Montar preguntas base

4\.

Subir imágenes de las primeras preguntas

5\.

Copiar enlace final

6\.

Entregarle:





enlace





instrucciones





copies para redes







##### Cómo lo dejaría yo de forma práctica

Plantilla base para cada tatuador

Tendrías un checklist así:

Datos





nombre artista





Instagram





teléfono WhatsApp





estilo principal





Quiz





quiz creado





preguntas cargadas





imágenes subidas





teléfono probado





Enlace





URL del quiz copiada





test completo hecho





Entrega





texto bio





texto story





texto reel







##### Lo que NO haría todavía

No montaría aún:





login por tatuador





panel privado para cada uno





subdominios





varias apps separadas





Porque ahora mismo eso solo te mete complejidad.



##### Cómo venderlo sin complicarte

Lo vendería así:

Producto

“Te dejo montado tu sistema de captación por WhatsApp”

Incluye:





quiz personalizado





mensajes preparados





IA para ayudarte a responder





enlace listo para Instagram





Y ya.

No hace falta explicar toda la cocina.



##### Siguiente mejora importante

Cuando tengas 2–3 tatuadores montados, el siguiente paso bueno es este:

Añadir columna owner\_name o tattoo\_artist\_name

Para que en admin veas claramente de quién es cada quiz sin depender solo del título.

Y luego:

Crear una vista simple para onboarding

Algo tipo:





crear tatuador





poner teléfono





generar quiz





copiar enlace





Ahora mismo lo puedes hacer manualmente sin problema.



##### Plan simple para montar a cada tatuador

Paso a paso corto





Crear fila en quizzes





Rellenar title, phone, tattoo\_artist\_name





Copiar o crear preguntas





Subir imágenes





Probar quiz completo





Copiar URL final





Entregar enlace y copies de Instagram







##### Mi recomendación final

Empieza así durante unas semanas:





tú montas todo manualmente





pruebas con 2–3 tatuadores





ves qué piden





detectas fricciones





Y luego automatizas.

Ese orden es el correcto.

Si quieres, el siguiente paso te lo dejo ya montado como checklist de onboarding para tatuadores, listo para usar cada vez que cierres uno.



\----------------------------------------------------------------------------------------------------



#### 🎯 OBJETIVO



No vender “tecnología”.



👉 vender esto:



“te llegan mejores clientes y pierdes menos tiempo”



#### 🧲 PASO 1: A QUIÉN ESCRIBIR



Empieza con:



tatuadores pequeños/medios

activos en Instagram

que suban trabajos

que respondan a comentarios



👉 NO vayas a estudios grandes todavía



#### ✉️ PASO 2: PRIMER MENSAJE (DM)



Copia y pega esto:



Ey tío 👋



Estoy montando un sistema para tatuadores que filtra clientes antes de que te escriban y hace que te lleguen mucho más claros por WhatsApp.



Lo estoy probando ahora mismo y está funcionando bastante bien.



Si quieres te lo enseño en 2 minutos y ves si te encaja 👀

#### 🧠 POR QUÉ FUNCIONA

corto

no vende agresivo

despierta curiosidad

no habla de “IA” ni “web”

#### 💬 RESPUESTA TÍPICA



Te dirán algo tipo:



👉 “¿cómo funciona?”

👉 “explícame”

👉 “vale”



#### 🎥 PASO 3: RESPUESTA + DEMO



Aquí NO escribas mucho.



👉 responde así:



Es básicamente esto:



la gente entra a un test rápido,

responde 4-5 preguntas

y ya te escribe por WhatsApp con una idea mucho más clara.



Así evitas perder tiempo con gente que no sabe ni lo que quiere.



Si quieres te paso un ejemplo y lo ves tú mismo.



👉 y le mandas TU link



#### 🔥 PASO 4: CIERRE (CLAVE)



Cuando lo vea, le dices:



Si te mola, te lo dejo montado para ti:



con tu estilo, tu teléfono y listo para usar en Instagram.



Tú solo tienes que poner el link en bio y ya.



Lo estoy dejando ahora mismo por X€ porque estoy probándolo con gente 👀

#### 💰 PRECIO PARA EMPEZAR



👉 recomendado:



50€ – 150€ (primeros clientes)



💥 objetivo:

no dinero → validación



#### 🧠 SI DUDA



Te dirá:



👉 “no sé si me servirá”



Tú respondes:



Total, lo peor que puede pasar es que no te sirva

y lo quitas.



Pero si te entran 2-3 clientes buenos,

ya te compensa de sobra.



💥 lógica simple = cierra



#### 🚀 BONUS (MUY IMPORTANTE)



Cuando cierres uno:



👉 dile esto:



Dame 2 días y te lo dejo montado.



👉 y cumples



#### 🎯 TU MISIÓN AHORA



Haz esto HOY:



escribe a 5 tatuadores

usa ese mensaje

enseña el link

intenta cerrar 1

#### ⚠️ REALIDAD



Te van a ignorar algunos

👉 normal



te responderán 1–2

👉 suficiente



#### 💥 CLAVE



No pienses:



👉 “¿y si no funciona?”



piensa:



👉 “¿cuántos tengo que escribir para cerrar uno?”



#### 🚀 SIGUIENTE PASO



Cuando hables con el primero:



👉 pásame lo que te diga



y te ayudo a responderle para cerrarlo 👀



