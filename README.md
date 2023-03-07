# Koa Middlware to parse QuerySet

Koa Middlware to parse QuerySet

## What is QuerySet

`QuerySet` is string format used in url query to express more.

```bash
?key$=1             # number 1
?key$=1.0           # number  1.0
?key$=true          # boolean true
?key$=false         # boolean false
?key$=null          # null
?key$=              # blank
?key$=1,2,3m        # 1, 2, and '3m'
?key$={1,2,3m}      # 1, 2, or '3m'
?key$=|1,2m,3       # 1, '2m', or 3
?key$=!             # not blank
?key$=!true         # not true
?key$=!1,2,3        # not in 1,2,3
?key$=*             # like '*'
?key$=*abc*def*     # like '*abc*def*'
?key$=!*abc*def*    # not like '*abc*def*'

# do not suppor to combind !/| with wildcard match
?key$=!1*,2*        # not in ('1*', '2*')
?key$=|a*,b*        # 'a*' or 'b*'
```

## Usage

```typescript
import QuerySet from 'koa-queryset';
app.use(QuerySet()); // it will modify ctx.query
```
