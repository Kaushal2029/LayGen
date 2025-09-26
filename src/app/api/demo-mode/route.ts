import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export async function GET() {
  try {
    // Return demo data that simulates successful AI responses
    const demoData = {
      dataAnalysis: {
        dataType: "Task Management Application",
        columns: ["Title", "Description", "Type", "Priority", "Status"],
        recordCount: "25 records",
        dataPatterns: "Structured data with title, description, type, priority, and status fields",
        suggestedAppType: "Project Management Dashboard",
        projectName: "Demo Project Manager",
        titleColumn: "Title"
      },
      designOptions: [
        {
          id: "demo_dashboard_1",
          name: "Modern Dashboard",
          description: "Clean dashboard with cards and filters",
          preview: "Modern card-based layout with search and filter options",
          components: [
            {
              name: "Header",
              type: "header",
              description: "Application header with title and search",
              properties: {
                title: "Project Management",
                showSearch: true
              },
              layout: {
                x: 0,
                y: 0,
                width: 1200,
                height: 80
              }
            },
            {
              name: "FilterBar",
              type: "filter",
              description: "Filter controls for type and priority",
              properties: {
                filters: ["Type", "Priority", "Status"]
              },
              layout: {
                x: 0,
                y: 80,
                width: 1200,
                height: 60
              }
            },
            {
              name: "DataGrid",
              type: "table",
              description: "Main data display table",
              properties: {
                columns: ["Title", "Description", "Type", "Priority", "Status", "Actions"],
                sortable: true,
                editable: true
              },
              layout: {
                x: 0,
                y: 140,
                width: 1200,
                height: 400
              }
            }
          ],
          layout: {
            type: "dashboard",
            theme: "light",
            colors: {
              primary: "#3B82F6",
              secondary: "#6B7280",
              background: "#FFFFFF",
              text: "#111827"
            }
          }
        }
      ],
      requirements: "Create a responsive web application for managing structured data with CRUD operations, filtering, and search functionality"
    };

    return NextResponse.json<ApiResponse<any>>({ // eslint-disable-line @typescript-eslint/no-explicit-any
      success: true,
      data: demoData,
      message: 'Demo mode - No API calls made'
    });

  } catch (error) {
    console.error('Demo mode error:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Demo mode failed'
    }, { status: 500 });
  }
}
