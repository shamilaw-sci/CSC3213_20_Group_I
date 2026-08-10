// dashbord overview
// dashbord overview
import RedirectionChart from "./components/redirectionChart";
import UserRole from "./components/userRole";

export default function Home(){
    return(
        <div>
            <h2 className="items-center justify-center text-3xl font-serif mb-4 p-7 text-italic " >Welcome to Admin Dash board</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-7">
                {/* Tiles Column */}
                <div className="grid grid-cols-1 gap-7">
                    <div className="bg-pink-50 p-4 hover:-translate-y-1 shadow rounded-2xl transition duration-600">
                        <h3 className="text-3xl font-semibold font-serif text-center py-2">Total Users</h3>
                        <p className="text-4xl text-center py-2 font-serif">~ 1,234</p>
                    </div>
                    <div className="bg-pink-50 p-4 hover:-translate-y-1 shadow rounded-2xl transition duration-600">
                        <h3 className="text-3xl font-semibold font-serif text-center py-2">Digital Twins</h3>
                        <p className="text-4xl text-center py-2 font-serif">~ 789</p>
                    </div>
                    <div className="bg-pink-50 p-4 hover:-translate-y-1 shadow rounded-2xl transition duration-600">
                        <h3 className="text-3xl font-semibold font-serif text-center py-2">Try-On sessions</h3>
                        <p className="text-4xl text-center py-2 font-serif">~ 567</p>
                    </div>
                    <div className="bg-pink-50 p-4 hover:-translate-y-1 shadow rounded-2xl transition duration-600">
                        <h3 className="text-3xl font-semibold font-serif text-center py-2">Total Garments</h3>
                        <p className="text-4xl text-center py-2 font-serif">~ 456</p>
                    </div>
                </div>
                {/* Pie Chart Column */}
                <div>
                    <UserRole/>
                </div>
            </div>
            

            <div className="p-6">
                <RedirectionChart/>
            </div>

            <div>
                
                
            </div>

        </div>
    )


}
