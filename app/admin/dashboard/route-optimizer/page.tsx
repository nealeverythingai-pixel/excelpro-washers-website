import Link from 'next/link'
import { Map, MapPin, Navigation, Calendar } from 'lucide-react'
import { db } from '@/lib/db'

export default async function RouteOptimizerPage({
  searchParams,
}: {
  searchParams: { date?: string }
}) {
  const selectedDate = searchParams.date || new Date().toISOString().split('T')[0]
  
  const jobs = await db.jobs.getAll()
  const clients = await db.clients.getAll()

  // Filter jobs for selected date and sort by time
  const todaysJobs = jobs
    .filter(job => job.startDate.startsWith(selectedDate))
    .sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  // Create route stops with addresses
  const stops = todaysJobs.map(job => {
      const client = clients.find(c => c.id === job.clientId)
      return {
          id: job.id,
          title: job.title,
          status: job.status,
          time: new Date(job.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          clientName: client ? `${client.firstName} ${client.lastName}` : 'Unknown Client',
          address: client?.address || '',
          lat: 0, // Mock lat/lng since we don't have geocoding
          lng: 0
      }
  }).filter(s => s.address) // Keep only jobs with addresses

  // Generate Google Maps Directions URL
  // https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=Last+Stop&waypoints=Stop1|Stop2
  
  // We'll treat the first job as the first stop after "Office" (simulated origin)
  // Or better, simulate the route starting from the first job
  
  // Assuming Origin is generic "Headquarters" or let the user navigate from first stop
  const origin = encodeURIComponent("Current Location") 
  const destination = stops.length > 0 ? encodeURIComponent(stops[stops.length - 1].address) : ""
  
  const waypoints = stops.slice(0, stops.length - 1).map(stop => encodeURIComponent(stop.address)).join('|')
  
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}`


  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Route Optimizer</h1>
          <p className="mt-1 text-sm text-gray-500">Coordinate your team's route for efficiency</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
             <form className="flex items-center space-x-2">
                <label htmlFor="date" className="text-sm font-medium text-gray-700">Date:</label>
                <input 
                    type="date" 
                    name="date" 
                    defaultValue={selectedDate}
                    className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                />
                <button type="submit" className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                    Go
                </button>
            </form>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
          {/* List View */}
          <div className="w-1/3 flex flex-col bg-white rounded-lg shadow h-full overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">Stops ({stops.length})</h3>
                  {stops.length > 0 && (
                      <a 
                        href={googleMapsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-green-700"
                      >
                          <Navigation className="mr-1 h-3 w-3" />
                          Optimize in Maps
                      </a>
                  )}
              </div>
              <div className="overflow-y-auto flex-1 p-4 space-y-4">
                  {stops.length === 0 ? (
                      <div className="text-center text-gray-500 py-10">
                          <p>No jobs scheduled for this date.</p>
                          <p className="text-xs mt-2">Select a different date above.</p>
                      </div>
                  ) : (
                      stops.map((stop, index) => (
                          <div key={stop.id} className="relative flex items-start space-x-3">
                               <div className="flex flex-col items-center">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white font-bold text-sm ring-4 ring-white shadow-sm z-10">
                                        {index + 1}
                                    </div>
                                    {index !== stops.length - 1 && (
                                        <div className="w-0.5 bg-gray-200 h-full absolute top-8 bottom-[-16px] left-4 -ml-px"></div>
                                    )}
                               </div>
                               <div className="bg-gray-50 rounded-lg p-3 w-full border border-gray-200">
                                   <div className="flex justify-between items-start">
                                       <h4 className="font-medium text-gray-900 text-sm">{stop.clientName}</h4>
                                       <span className="text-xs font-mono text-gray-500">{stop.time}</span>
                                   </div>
                                   <p className="text-xs text-gray-500 mt-1">{stop.title}</p>
                                   <div className="flex items-center mt-2 text-xs text-gray-600">
                                       <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                                       {stop.address}
                                   </div>
                               </div>
                          </div>
                      ))
                  )}
              </div>
          </div>

          {/* Map View Placeholder */}
           <div className="flex-1 bg-white rounded-lg shadow overflow-hidden relative">
               {/* Since we don't have a real map API, we'll create a stylized placeholder or static visualization */}
               <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                        <Map className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Map Visualization</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mt-2">
                            Interactive map preview requires a Google Maps API Key. 
                            Use the <b>"Optimize in Maps"</b> button to view the real route.
                        </p>
                        
                        {/* CSS Visualization of a route */}
                        {stops.length > 0 && (
                            <div className="mt-8 flex justify-center space-x-4">
                                {stops.map((_, i) => ( i < 4 && 
                                    <div key={i} className="flex items-center">
                                        <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                                        {i < Math.min(stops.length - 1, 3) && <div className="w-8 h-0.5 bg-green-300 mx-1"></div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
               </div>
               
               {/* Simulated Map Markers Layer (Visual fluff) */}
                <div className="absolute inset-0 pointer-events-none opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}></div>
           </div>
      </div>
    </div>
  )
}
