export default function AccountSettings(){

return(

<div>

<h2 className="text-2xl font-bold text-black mb-4">
Account Settings
</h2>


<p className="text-gray-600 mb-6">
Manage your account information.
</p>



<div className="space-y-4">


<input
value="hanarafai0714"
readOnly
className="w-full border border-black rounded-lg p-3 text-black"
/>


<input
value="hanarafai0714@gmail.com"
readOnly
className="w-full border border-black rounded-lg p-3 text-black"
/>


<input
value="hanarafai0714"
readOnly
className="w-full border border-black rounded-lg p-3 text-black"
/>


</div>



<button className="mt-6 bg-violet-600 text-white px-6 py-3 rounded-lg">
Update Account
</button>


</div>

)

}