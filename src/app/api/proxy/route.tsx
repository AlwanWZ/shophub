export async function GET() {
    try {
      const res = await fetch('https://mmc-clinic.com/dipa/api/mhs.php', {
        cache: "no-store",
      });
      const data = await res.json();
  
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ message: 'Error fetching data' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }