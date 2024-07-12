import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { dayjs } from "../lib/dayjs"
export async function getLinks(app: FastifyInstance){
  app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/links', {
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
        links: true,
      }
    })
    
    if(!trip){
      throw new Error('Trip not found.')
    }

    
    return res.status(200).send({ links:trip.links })
  })
}