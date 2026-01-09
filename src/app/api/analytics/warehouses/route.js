import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import connectMongoDB from "@/libs/mongodb";
import Booking from "@/Models/Booking";
import Warehouse from "@/Models/Warehouse";
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    await connectMongoDB();

    // Check authentication
    let userId = null;
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          if (!process.env.JWT_SECRET) {
            throw new Error("JWT secret not configured");
          }
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.userId || decoded.id;
        } catch (tokenError) {
          return new Response(
            JSON.stringify({ error: "Invalid or expired token" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
          );
        }
      }
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30days';

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (range) {
      case '7days':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '90days':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      default: // 30 days
        startDate = new Date(now.setDate(now.getDate() - 30));
    }

    // Get dealer's warehouses
    const warehouses = await Warehouse.find({ dealer: userId });
    const warehouseIds = warehouses.map(w => w._id);

    if (warehouseIds.length === 0) {
      return new Response(
        JSON.stringify({
          stats: {
            totalRevenue: 0,
            totalArea: 0,
            bookedArea: 0,
            totalRequests: 0,
            confirmedBookings: 0,
            activeBookings: 0,
            pendingRequests: 0,
            totalWarehouses: 0,
            activeWarehouses: 0
          },
          trends: [],
          revenue: [],
          activities: []
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get booking statistics
    const bookings = await Booking.find({
      warehouse: { $in: warehouseIds },
      createdAt: { $gte: startDate }
    }).populate('warehouse corporate');

    const totalRequests = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length;
    const activeBookings = bookings.filter(b => b.status === 'confirmed').length;
    const pendingRequests = bookings.filter(b => b.status === 'pending').length;

    // Calculate revenue and area metrics
    let totalRevenue = 0;
    let bookedArea = 0;
    const totalArea = warehouses.reduce((sum, w) => sum + w.totalArea, 0);

    bookings.forEach(booking => {
      if (booking.status === 'confirmed' || booking.status === 'completed') {
        totalRevenue += booking.totalPrice || 0;
        bookedArea += booking.requiredArea || 0;
      }
    });

    // Generate trends data
    const trends = [];
    const revenueData = [];
    const periodDays = range === '7days' ? 1 : range === '30days' ? 3 : 7;
    
    for (let i = 11; i >= 0; i--) {
      const periodStart = new Date(startDate);
      periodStart.setDate(periodStart.getDate() + (i * periodDays));
      const periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + periodDays);

      const periodBookings = bookings.filter(b => 
        new Date(b.createdAt) >= periodStart && new Date(b.createdAt) < periodEnd
      );

      const periodRevenue = periodBookings
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      trends.push({
        date: periodStart.toISOString().split('T')[0],
        bookings: periodBookings.length,
        revenue: periodRevenue
      });

      revenueData.push({
        period: periodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: periodRevenue
      });
    }

    // Get recent activities
    const recentBookings = await Booking.find({
      warehouse: { $in: warehouseIds }
    })
    .populate('warehouse corporate')
    .sort({ createdAt: -1 })
    .limit(5);

    const activities = recentBookings.map(booking => ({
      type: 'booking',
      title: `Booking request for ${booking.warehouse?.name || 'Warehouse'}`,
      description: `${booking.corporate?.companyDetails?.name || booking.corporate?.firstName || 'Corporate'} requested ${booking.requiredArea} sqft`,
      timestamp: booking.createdAt,
      status: booking.status
    }));

    return new Response(
      JSON.stringify({
        stats: {
          totalRevenue,
          totalArea,
          bookedArea,
          totalRequests,
          confirmedBookings,
          activeBookings,
          pendingRequests,
          totalWarehouses: warehouses.length,
          activeWarehouses: warehouses.filter(w => w.status === 'active').length
        },
        trends,
        revenue: revenueData,
        activities
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Warehouse analytics error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}