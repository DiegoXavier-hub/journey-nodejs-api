import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { dayjs } from "../lib/dayjs"
import { prisma } from "../lib/prisma"
export async function createActivity(app: FastifyInstance){
  app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/activities', {
    schema: {   
      params: z.object({
        tripId: z.string().uuid(),
      }),
      body: z.object({
        tittle: z.string().min(4, { message: 'Tittle must be at least 4 characters long' }),
        occurs_at: z.coerce.date()
      })
    },
  }, async ( req, res )=>{
    const { tripId } = req.params
    const { tittle, occurs_at } = req.body 

    const trip = await prisma.trip.findUnique({
      where:{
        id: tripId,
      }
    })
    
    if(!trip){
      throw new Error('Trip not found.')
    }

    if(dayjs(occurs_at).isBefore(trip.starts_at)){
      throw new Error('Activity cannot occur before trip start date.')
    }

    if(dayjs(occurs_at).isAfter(trip.ends_at)){
      throw new Error('Activity cannot occur after trip end date.')
    }

    const activity = await prisma.activity.create({
      data:{
        tittle,
        occurs_at,
        trip_id: tripId
      }
    })

    return res.status(201).send({activity})
  })
}
