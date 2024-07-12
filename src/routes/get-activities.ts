import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { dayjs } from "../lib/dayjs"
export async function getActivities(app: FastifyInstance){
  app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/activities', {
    schema: {   
      params: z.object({
        tripId: z.string().uuid(),
      }),
    },
  }, async ( req, res )=>{
    const { tripId } = req.params

    const trip = await prisma.trip.findUnique({
      where:{
        id: tripId,
      },
      include: {
        activities: {
          orderBy: {
            occurs_at: 'asc',
          }
        },
      }
    })
    
    if(!trip){
      throw new Error('Trip not found.')
    }

    const differenceInDaysBetweenTripStartAndTripEnd = dayjs(trip.ends_at).diff(trip.starts_at, 'days')
    
    const activities = Array.from({length: differenceInDaysBetweenTripStartAndTripEnd + 1}).map((_, index)=>{
      const date = dayjs(trip.starts_at).add(index, 'days')
      return {
        date: date.format('DD/MM/YYYY'),
        activities: trip.activities.filter(activity=>dayjs(activity.occurs_at).isSame(date, 'day')),
      }
    })

    return res.status(200).send({ activities })
  })
}
