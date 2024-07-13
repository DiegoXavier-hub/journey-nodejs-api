import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { ClientError } from "../errors/client-error"
import { prisma } from "../lib/prisma"
export async function getParticipants(app: FastifyInstance){
  app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/participants', {
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
        participants: {
          select:{
            id: true,
            name: true,
            email: true,
            is_confirmed: true,
          }
        },
      }
    })
    
    if(!trip){
      throw new ClientError('Trip not found.')
    }

    return res.status(200).send({ participants: trip.participants })
  })
}