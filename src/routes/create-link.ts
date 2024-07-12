import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "../lib/prisma"
export async function createLink(app: FastifyInstance){
  app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/links', {
    schema: {   
      params: z.object({
        tripId: z.string().uuid(),
      }),
      body: z.object({
        tittle: z.string().min(4, { message: 'Tittle must be at least 4 characters long' }),
        url: z.string().url(),
      })
    },
  }, async ( req, res )=>{
    const { tripId } = req.params
    const { tittle, url } = req.body 

    const trip = await prisma.trip.findUnique({
      where:{
        id: tripId,
      }
    })
    
    if(!trip){
      throw new Error('Trip not found.')
    }

    const link = await prisma.link.create({
      data:{
        tittle,
        url,
        trip_id: tripId
      }
    })

    return res.status(201).send({link})
  })
}
