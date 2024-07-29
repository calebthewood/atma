# Prisma Reminders

Create an SQL migration file and execute it:
```Bash
npm exec prisma migrate dev
```

Whenever you make changes to your database that are reflected in the Prisma schema, you need to manually re-generate Prisma Client to update the generated code in the node_modules/.prisma/client directory:
```Bash
prisma generate
```